use std::sync::{
    atomic::{AtomicUsize, Ordering},
    Arc,
};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use anyhow::{Context, Result};
use futures::{stream, StreamExt};
use reqwest::{redirect::Policy, Client, Proxy, StatusCode};

use crate::protocol::{CheckSettings, ProxyCandidate, ProxyCheckResult, ProxyCheckStatus};

#[derive(Clone, Debug)]
pub struct CheckProgress {
    pub checked: usize,
    pub working: usize,
    pub failed: usize,
    pub queued: usize,
    pub total: usize,
}

#[derive(Clone, Debug)]
pub struct CheckSummary {
    pub checked: usize,
    pub working: usize,
    pub failed: usize,
    pub total: usize,
    pub stopped_after_goal: bool,
}

pub enum CheckEvent {
    Result(ProxyCheckResult),
    Progress(CheckProgress),
}

#[derive(Clone, Debug)]
pub struct ProxyChecker {
    settings: CheckSettings,
}

impl ProxyChecker {
    pub fn new(settings: CheckSettings) -> Self {
        Self {
            settings: settings.normalized(),
        }
    }

    pub async fn check<F>(&self, proxies: Vec<ProxyCandidate>, mut on_event: F) -> CheckSummary
    where
        F: FnMut(CheckEvent),
    {
        let candidates = self.candidates(proxies);
        let total = candidates.len();
        let counters = CheckCounters::new(total);
        let probe = ProxyProbe::new(self.settings.clone());

        let mut results = stream::iter(candidates)
            .map(|proxy| {
                let counters = counters.clone();
                let probe = probe.clone();

                async move {
                    if counters.goal_reached(probe.max_working()) {
                        return None;
                    }

                    let result = probe.check(proxy).await;
                    counters.record(&result);
                    Some(result)
                }
            })
            .buffer_unordered(self.settings.concurrency);

        while let Some(result) = results.next().await {
            let Some(result) = result else {
                continue;
            };

            on_event(CheckEvent::Result(result));
            on_event(CheckEvent::Progress(counters.progress()));

            if counters.goal_reached(self.settings.max_working) {
                break;
            }
        }

        counters.summary(self.settings.max_working)
    }

    fn candidates(&self, proxies: Vec<ProxyCandidate>) -> Vec<ProxyCandidate> {
        proxies
            .into_iter()
            .take(self.settings.max_candidates)
            .collect()
    }
}

#[derive(Clone, Debug)]
struct ProxyProbe {
    settings: CheckSettings,
}

impl ProxyProbe {
    fn new(settings: CheckSettings) -> Self {
        Self { settings }
    }

    fn max_working(&self) -> usize {
        self.settings.max_working
    }

    async fn check(&self, proxy: ProxyCandidate) -> ProxyCheckResult {
        let started_at = Instant::now();
        let checked_at = unix_time_millis();
        let outcome = self.request_through_proxy(&proxy).await;

        match outcome {
            Ok(()) => ProxyCheckResult {
                proxy_id: proxy.id,
                status: ProxyCheckStatus::Working,
                latency_ms: Some(started_at.elapsed().as_millis()),
                checked_at,
                error: None,
            },
            Err(error) => ProxyCheckResult {
                proxy_id: proxy.id,
                status: ProxyCheckStatus::Failed,
                latency_ms: None,
                checked_at,
                error: Some(compact_error(error)),
            },
        }
    }

    async fn request_through_proxy(&self, proxy: &ProxyCandidate) -> Result<()> {
        let proxy_url = proxy.protocol.proxy_url(&proxy.host, proxy.port);
        let proxy =
            Proxy::all(&proxy_url).with_context(|| format!("invalid proxy URL: {proxy_url}"))?;
        let client = Client::builder()
            .proxy(proxy)
            .timeout(Duration::from_millis(self.settings.timeout_ms))
            .redirect(Policy::none())
            .build()
            .context("failed to create HTTP client")?;

        let mut last_error = None;

        for target in &self.settings.targets {
            match client.get(target).send().await {
                Ok(response) if is_successful_check_status(response.status()) => return Ok(()),
                Ok(response) => {
                    last_error = Some(anyhow::anyhow!("unexpected status {}", response.status()));
                }
                Err(error) => {
                    last_error = Some(error.into());
                }
            }
        }

        Err(last_error.unwrap_or_else(|| anyhow::anyhow!("all check targets failed")))
    }
}

#[derive(Clone, Debug)]
struct CheckCounters {
    checked: Arc<AtomicUsize>,
    working: Arc<AtomicUsize>,
    failed: Arc<AtomicUsize>,
    total: usize,
}

impl CheckCounters {
    fn new(total: usize) -> Self {
        Self {
            checked: Arc::new(AtomicUsize::new(0)),
            working: Arc::new(AtomicUsize::new(0)),
            failed: Arc::new(AtomicUsize::new(0)),
            total,
        }
    }

    fn record(&self, result: &ProxyCheckResult) {
        self.checked.fetch_add(1, Ordering::Relaxed);

        match result.status {
            ProxyCheckStatus::Working => {
                self.working.fetch_add(1, Ordering::Relaxed);
            }
            ProxyCheckStatus::Failed => {
                self.failed.fetch_add(1, Ordering::Relaxed);
            }
        }
    }

    fn progress(&self) -> CheckProgress {
        let checked = self.checked();

        CheckProgress {
            checked,
            working: self.working(),
            failed: self.failed(),
            queued: self.total.saturating_sub(checked),
            total: self.total,
        }
    }

    fn summary(&self, max_working: usize) -> CheckSummary {
        let working = self.working();

        CheckSummary {
            checked: self.checked(),
            working,
            failed: self.failed(),
            total: self.total,
            stopped_after_goal: working >= max_working,
        }
    }

    fn goal_reached(&self, max_working: usize) -> bool {
        self.working() >= max_working
    }

    fn checked(&self) -> usize {
        self.checked.load(Ordering::Relaxed)
    }

    fn working(&self) -> usize {
        self.working.load(Ordering::Relaxed)
    }

    fn failed(&self) -> usize {
        self.failed.load(Ordering::Relaxed)
    }
}

fn is_successful_check_status(status: StatusCode) -> bool {
    status == StatusCode::NO_CONTENT || status.is_success() || status.is_redirection()
}

fn unix_time_millis() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}

fn compact_error(error: anyhow::Error) -> String {
    let message = error.to_string();

    if message.len() <= 180 {
        return message;
    }

    format!("{}...", &message[..177])
}

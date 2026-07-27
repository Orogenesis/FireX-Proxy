use std::fs;
use std::path::PathBuf;

use anyhow::{Context, Result};

use crate::checker::{CheckEvent, ProxyChecker};
use crate::protocol::{CheckSettings, ProxyCheckStatus};
use crate::proxy_file::ProxyFileParser;

const DEFAULT_MAX_WORKING: usize = 10;

pub struct CheckFileCommand {
    path: PathBuf,
    max_working: usize,
    parser: ProxyFileParser,
}

impl CheckFileCommand {
    pub fn new(path: impl Into<PathBuf>, max_working: Option<usize>) -> Self {
        Self {
            path: path.into(),
            max_working: max_working.unwrap_or(DEFAULT_MAX_WORKING),
            parser: ProxyFileParser,
        }
    }

    pub async fn run(&self) -> Result<()> {
        let content = fs::read_to_string(&self.path)
            .with_context(|| format!("failed to read {}", self.path.display()))?;
        let proxies = self.parser.parse(&content);
        let settings = CheckSettings {
            max_working: self.max_working,
            ..CheckSettings::default()
        };

        eprintln!(
            "checking {} candidate proxies, stopping after {} working",
            proxies.len(),
            settings.max_working
        );

        let summary = ProxyChecker::new(settings)
            .check(proxies, |event| match event {
                CheckEvent::Result(result) => {
                    if result.status == ProxyCheckStatus::Working {
                        println!(
                            "{} {}ms",
                            result.proxy_id,
                            result.latency_ms.unwrap_or_default()
                        );
                    }
                }
                CheckEvent::Progress(progress) => {
                    eprintln!(
                        "checked={} working={} failed={} queued={}",
                        progress.checked, progress.working, progress.failed, progress.queued
                    );
                }
            })
            .await;

        eprintln!(
            "finished: checked={} working={} failed={} total={}",
            summary.checked, summary.working, summary.failed, summary.total
        );

        Ok(())
    }
}

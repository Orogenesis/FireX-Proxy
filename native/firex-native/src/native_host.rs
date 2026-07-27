use std::io::{Read, Write};

use anyhow::Result;

use crate::checker::{CheckEvent, CheckSummary, ProxyChecker};
use crate::native_io::{read_message, write_message};
use crate::protocol::{
    CheckSettings, HostRequest, HostResponse, ProxyCandidate, HOST_VERSION, PROTOCOL_VERSION,
};

pub struct NativeHost<R, W> {
    input: R,
    output: W,
}

impl<R, W> NativeHost<R, W>
where
    R: Read,
    W: Write,
{
    pub fn new(input: R, output: W) -> Self {
        Self { input, output }
    }

    pub async fn run(&mut self) -> Result<()> {
        while let Some(request) = read_message::<HostRequest>(&mut self.input)? {
            self.handle_request(request).await?;
        }

        Ok(())
    }

    async fn handle_request(&mut self, request: HostRequest) -> Result<()> {
        match request {
            HostRequest::Ping => self.write_pong(),
            HostRequest::Check {
                request_id,
                proxies,
                settings,
            } => self.run_check(request_id, proxies, settings).await,
        }
    }

    fn write_pong(&mut self) -> Result<()> {
        write_message(
            &mut self.output,
            &HostResponse::Pong {
                version: HOST_VERSION,
                protocol_version: PROTOCOL_VERSION,
            },
        )
    }

    async fn run_check(
        &mut self,
        request_id: String,
        proxies: Vec<ProxyCandidate>,
        settings: CheckSettings,
    ) -> Result<()> {
        if let Err(error) = self.try_run_check(request_id, proxies, settings).await {
            write_message(
                &mut self.output,
                &HostResponse::Error {
                    message: error.to_string(),
                },
            )?;
        }

        Ok(())
    }

    async fn try_run_check(
        &mut self,
        request_id: String,
        proxies: Vec<ProxyCandidate>,
        settings: CheckSettings,
    ) -> Result<()> {
        let settings = settings.normalized();
        let total = proxies.len().min(settings.max_candidates);

        write_message(
            &mut self.output,
            &HostResponse::CheckStarted {
                request_id: request_id.clone(),
                total,
                max_working: settings.max_working,
                concurrency: settings.concurrency,
            },
        )?;

        let mut reporter = NativeCheckReporter::new(&mut self.output, request_id.clone());
        let checker = ProxyChecker::new(settings);
        let summary = checker.check(proxies, |event| reporter.report(event)).await;

        reporter.finish(request_id, summary)
    }
}

struct NativeCheckReporter<'a, W> {
    output: &'a mut W,
    request_id: String,
}

impl<'a, W> NativeCheckReporter<'a, W>
where
    W: Write,
{
    fn new(output: &'a mut W, request_id: String) -> Self {
        Self { output, request_id }
    }

    fn report(&mut self, event: CheckEvent) {
        let result = match event {
            CheckEvent::Result(result) => write_message(
                self.output,
                &HostResponse::ProxyChecked {
                    request_id: self.request_id.clone(),
                    result,
                },
            ),
            CheckEvent::Progress(progress) => write_message(
                self.output,
                &HostResponse::Progress {
                    request_id: self.request_id.clone(),
                    checked: progress.checked,
                    working: progress.working,
                    failed: progress.failed,
                    queued: progress.queued,
                    total: progress.total,
                },
            ),
        };

        if let Err(error) = result {
            eprintln!("failed to write checker event: {error:#}");
        }
    }

    fn finish(&mut self, request_id: String, summary: CheckSummary) -> Result<()> {
        write_message(
            self.output,
            &HostResponse::CheckFinished {
                request_id,
                checked: summary.checked,
                working: summary.working,
                failed: summary.failed,
                total: summary.total,
                stopped_after_goal: summary.stopped_after_goal,
            },
        )
    }
}

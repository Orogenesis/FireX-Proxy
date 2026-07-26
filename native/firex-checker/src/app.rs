use std::io::{self, BufReader, BufWriter};

use anyhow::{bail, Context, Result};

use crate::cli::CheckFileCommand;
use crate::native_host::NativeHost;
use crate::protocol::HOST_VERSION;

pub enum AppCommand {
    NativeHost,
    CheckFile(CheckFileCommand),
    Version,
}

impl AppCommand {
    pub fn from_env() -> Result<Self> {
        Self::from_args(std::env::args())
    }

    fn from_args(args: impl IntoIterator<Item = String>) -> Result<Self> {
        let mut args = args.into_iter();
        let _binary = args.next();
        let Some(command) = args.next() else {
            return Ok(Self::NativeHost);
        };

        match command.as_str() {
            "--check-file" => {
                let path = args
                    .next()
                    .context("usage: firex-checker --check-file <path> [max-working]")?;
                let max_working = args.next().map(|value| {
                    value
                        .parse::<usize>()
                        .with_context(|| format!("invalid max-working value: {value}"))
                });

                if args.next().is_some() {
                    bail!("usage: firex-checker --check-file <path> [max-working]");
                }

                Ok(Self::CheckFile(CheckFileCommand::new(
                    path,
                    max_working.transpose()?,
                )))
            }
            "--version" | "-V" => Ok(Self::Version),
            command if command.starts_with('-') => bail!("unknown command: {command}"),
            _browser_launch_argument => Ok(Self::NativeHost),
        }
    }

    pub async fn run(self) -> Result<()> {
        match self {
            Self::NativeHost => run_native_host().await,
            Self::CheckFile(command) => command.run().await,
            Self::Version => {
                println!("{HOST_VERSION}");
                Ok(())
            }
        }
    }
}

async fn run_native_host() -> Result<()> {
    let stdin = io::stdin();
    let stdout = io::stdout();
    let input = BufReader::new(stdin.lock());
    let output = BufWriter::new(stdout.lock());

    NativeHost::new(input, output).run().await
}

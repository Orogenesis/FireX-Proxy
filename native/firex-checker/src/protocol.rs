use serde::{Deserialize, Serialize};
use std::{fmt, str::FromStr};

pub const HOST_VERSION: &str = env!("CARGO_PKG_VERSION");
pub const PROTOCOL_VERSION: u16 = 1;

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum HostRequest {
    Ping,
    #[serde(rename_all = "camelCase")]
    Check {
        request_id: String,
        proxies: Vec<ProxyCandidate>,
        settings: CheckSettings,
    },
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ProxyCandidate {
    pub id: String,
    pub protocol: ProxyProtocol,
    pub host: String,
    pub port: u16,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum ProxyProtocol {
    Http,
    Https,
    Socks4,
    Socks5,
}

impl ProxyProtocol {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Http => "HTTP",
            Self::Https => "HTTPS",
            Self::Socks4 => "SOCKS4",
            Self::Socks5 => "SOCKS5",
        }
    }

    pub fn proxy_url(self, host: &str, port: u16) -> String {
        let scheme = match self {
            Self::Http => "http",
            Self::Https => "https",
            Self::Socks4 => "socks4",
            Self::Socks5 => "socks5h",
        };

        format!("{scheme}://{host}:{port}")
    }
}

impl FromStr for ProxyProtocol {
    type Err = UnsupportedProxyProtocol;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value.to_ascii_lowercase().as_str() {
            "http" => Ok(Self::Http),
            "https" => Ok(Self::Https),
            "socks4" => Ok(Self::Socks4),
            "socks5" => Ok(Self::Socks5),
            _ => Err(UnsupportedProxyProtocol),
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub struct UnsupportedProxyProtocol;

impl fmt::Display for UnsupportedProxyProtocol {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str("unsupported proxy protocol")
    }
}

impl std::error::Error for UnsupportedProxyProtocol {}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckSettings {
    pub max_working: usize,
    pub max_candidates: usize,
    pub concurrency: usize,
    pub timeout_ms: u64,
    pub targets: Vec<String>,
}

impl Default for CheckSettings {
    fn default() -> Self {
        Self {
            max_working: 10,
            max_candidates: 300,
            concurrency: 15,
            timeout_ms: 7_000,
            targets: default_targets(),
        }
    }
}

impl CheckSettings {
    pub fn normalized(self) -> Self {
        let max_working = self.max_working.clamp(1, 500);
        let max_candidates = self.max_candidates.clamp(max_working, 20_000);
        let concurrency = self.concurrency.clamp(1, 512);
        let timeout_ms = self.timeout_ms.clamp(1_000, 30_000);
        let targets = if self.targets.is_empty() {
            default_targets()
        } else {
            self.targets
        };

        Self {
            max_working,
            max_candidates,
            concurrency,
            timeout_ms,
            targets,
        }
    }
}

pub fn default_targets() -> Vec<String> {
    vec![
        "https://www.gstatic.com/generate_204".to_owned(),
        "http://connectivitycheck.gstatic.com/generate_204".to_owned(),
    ]
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProxyCheckResult {
    pub proxy_id: String,
    pub status: ProxyCheckStatus,
    pub latency_ms: Option<u128>,
    pub checked_at: u128,
    pub error: Option<String>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ProxyCheckStatus {
    Working,
    Failed,
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum HostResponse {
    #[serde(rename_all = "camelCase")]
    Pong {
        version: &'static str,
        protocol_version: u16,
    },
    #[serde(rename_all = "camelCase")]
    CheckStarted {
        request_id: String,
        total: usize,
        max_working: usize,
        concurrency: usize,
    },
    #[serde(rename_all = "camelCase")]
    ProxyChecked {
        request_id: String,
        result: ProxyCheckResult,
    },
    #[serde(rename_all = "camelCase")]
    Progress {
        request_id: String,
        checked: usize,
        working: usize,
        failed: usize,
        queued: usize,
        total: usize,
    },
    #[serde(rename_all = "camelCase")]
    CheckFinished {
        request_id: String,
        checked: usize,
        working: usize,
        failed: usize,
        total: usize,
        stopped_after_goal: bool,
    },
    Error {
        message: String,
    },
}

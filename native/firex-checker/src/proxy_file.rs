use std::str::FromStr;

use crate::protocol::{ProxyCandidate, ProxyProtocol};

#[derive(Default)]
pub struct ProxyFileParser;

impl ProxyFileParser {
    pub fn parse(&self, content: &str) -> Vec<ProxyCandidate> {
        content.lines().filter_map(Self::parse_line).collect()
    }

    fn parse_line(line: &str) -> Option<ProxyCandidate> {
        let value = line.split('#').next()?.trim();

        if value.is_empty() {
            return None;
        }

        let (protocol, address) = value.split_once("://")?;
        let (host, port) = address.rsplit_once(':')?;
        let protocol = ProxyProtocol::from_str(protocol).ok()?;
        let port = port.parse::<u16>().ok()?;
        let host = host.trim();

        Some(ProxyCandidate {
            id: format!("{}:{}:{port}", protocol.as_str(), host.to_ascii_lowercase()),
            protocol,
            host: host.to_owned(),
            port,
        })
    }
}

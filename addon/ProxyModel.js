class ProxyModel {
    constructor(raw = {}) {
        this.server       = raw.server;
        this.port         = parseInt(raw.port);
        this.iso_code     = raw.iso_code;
        this.country      = raw.country;
        this.protocol     = raw.protocol;
        this.ping_time_ms = parseInt(raw.ping_time_ms);
        this.loss_ratio   = parseInt(raw.loss_ratio);
    }
}

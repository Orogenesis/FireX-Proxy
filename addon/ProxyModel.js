
class ProxyModel {

    constructor(json) {
        this.server = String(json.server);
        this.port = parseInt(json.port);
        this.iso_code = String(json.iso_code);
        this.country = String(json.country);
        this.protocol = String(json.protocol);
        this.ping_time_ms = parseInt(json.ping_time_ms);
        this.loss_ratio = parseInt(json.loss_ratio);
    }
}
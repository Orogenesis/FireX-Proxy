<template>
    <v-menu :close-on-content-click="false"
            :light="true"
            top
            left
            max-width="80%"
            v-model="menuState"
            min-width="80%">
        <v-btn slot="activator" icon :dark="true">
            <v-icon>add</v-icon>
        </v-btn>
        <v-card>
            <v-form ref="form" spellcheck="false">
                <v-container>
                    <h3>{{ 'add_new_server' | translate }}</h3>
                    <v-radio-group v-model="protocol">
                        <v-radio :label="'HTTP'" :value="'HTTP'"></v-radio>
                        <v-radio :label="'HTTPS'" :value="'HTTPS'"></v-radio>
                        <v-radio :label="'SOCKS5'" :value="'SOCKS5'"></v-radio>
                        <v-radio :label="'SOCKS4'" :value="'SOCKS4'"></v-radio>
                    </v-radio-group>
                    <h3>{{ 'details' | translate }}</h3>
                    <v-layout>
                        <v-flex xs8>
                            <v-text-field :rules="[rules.required]"
                                          append-icon="web"
                                          v-model.trim="ipAddress"
                                          :label="this.$options.filters.translate('hostname')">
                            </v-text-field>
                        </v-flex>
                        <v-flex xs4>
                            <v-text-field :rules="[rules.required, rules.port]"
                                          v-model.trim="port"
                                          :label="this.$options.filters.translate('port')">
                            </v-text-field>
                        </v-flex>
                    </v-layout>
                    <div v-if="credentialsAvailable">
                        <h3>{{ 'credentials' | translate }}</h3>
                        <v-text-field append-icon="perm_identity"
                                      v-model.trim="username"
                                      :label="this.$options.filters.translate('username')">
                        </v-text-field>
                        <v-text-field append-icon="security"
                                      v-model.trim="password"
                                      type="password"
                                      :label="this.$options.filters.translate('password')">
                        </v-text-field>
                    </div>
                    <v-alert v-else :value="true" type="info">
                        {{ 'authentication_support_warning' | translate }}
                    </v-alert>
                    <v-layout>
                        <v-flex xs6>
                            <v-btn small outline block color="primary lighten-1" @click="add">
                                {{ 'create' | translate }}
                            </v-btn>
                        </v-flex>
                        <v-flex xs6>
                            <v-btn small outline block color="error" @click="reset">
                                {{ 'reset' | translate }}
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-form>
        </v-card>
    </v-menu>
</template>

<script>
    import * as browser from 'webextension-polyfill'

    const permissions = { permissions: ['webRequest', 'webRequestBlocking'], origins: ['<all_urls>'] };

    export default {
        name: 'AddProxyComponent',
        data() {
            return {
                menuState: false,
                rules: {
                    required: value => value.length > 0 || this.$options.filters.translate('required_validation'),
                    port: value => (parseInt(value) >= 0 && parseInt(value) <= 65535) || this.$options.filters.translate('port_validation')
                }
            }
        },
        computed: {
            credentialsAvailable() {
                if (navigator.userAgent.indexOf('Chrome') === -1) {
                    return ['SOCKS4'].includes(this.protocol) === false;
                }

                return ['SOCKS4', 'SOCKS5'].includes(this.protocol) === false;
            },
            protocol: {
                get() {
                    return this.$store.state.proxies.createForm.protocol;
                },
                set(newValue) {
                    this.$store.dispatch('proxies/modifyForm', { field: 'protocol', value: newValue });
                }
            },
            ipAddress: {
                get() {
                    return this.$store.state.proxies.createForm.ipAddress;
                },
                set(newValue) {
                    this.$store.dispatch('proxies/modifyForm', { field: 'ipAddress', value: newValue });
                }
            },
            port: {
                get() {
                    return this.$store.state.proxies.createForm.port;
                },
                set(newValue) {
                    this.$store.dispatch('proxies/modifyForm', { field: 'port', value: newValue });
                }
            },
            username: {
                get() {
                    return this.$store.state.proxies.createForm.username;
                },
                set(newValue) {
                    this.$store.dispatch('proxies/modifyForm', { field: 'username', value: newValue });
                }
            },
            password: {
                get() {
                    return this.$store.state.proxies.createForm.password;
                },
                set(newValue) {
                    this.$store.dispatch('proxies/modifyForm', { field: 'password', value: newValue });
                }
            }
        },
        methods: {
            reset() {
                this.$store.dispatch('proxies/resetForm');
                this.$refs.form.resetValidation();
            },
            add() {
                if (!this.$refs.form.validate()) {
                    return;
                }

                browser.permissions.contains(permissions).then(yes => {
                    if (yes) {
                        return this.create();
                    }

                    this.requestPermissions();
                })
            },
            async create() {
                const newProxy = {
                    protocol: this.protocol,
                    ipAddress: this.ipAddress,
                    port: this.port,
                    username: this.username,
                    password: this.password
                };

                this.reset();
                this.menuState = false;
                this.$store.dispatch('proxies/addProxy', newProxy);
            },
            requestPermissions() {
                if (navigator.userAgent.indexOf('Chrome') > -1) {
                    browser.permissions.request(permissions).then(granted => {
                        if (!granted) {
                            return;
                        }

                        this.create();
                    })
                } else {
                    const width = 440;
                    const height = 220;

                    const left = Math.floor(screen.width / 2 - width / 2);
                    const top = Math.floor(screen.height / 2 - height / 2);

                    browser.windows.create({
                        url: browser.extension.getURL("prompt.html"),
                        type: 'popup',
                        width,
                        height,
                        left,
                        top
                    });
                }
            }
        },
        mounted() {
            this.$store.dispatch('proxies/updateForm');
        }
    }
</script>

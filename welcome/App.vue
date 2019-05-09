<template>
    <v-app>
        <v-toolbar class="elevation-0" dark color="#7d4eff">
            <v-toolbar-title>FireX Proxy</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items class="hidden-sm-and-down">
                <v-btn flat href="https://www.firexproxy.com" target="_blank">Список прокси</v-btn>
                <v-btn flat href="https://www.firexproxy.com/proxy-checker" target="_blank">Проверка прокси</v-btn>
                <v-btn flat href="https://www.firexproxy.com/checkout" target="_blank">Купить премиум</v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <v-container>
            <v-card class="ml-3 mb-5 elevation-0" dark color="rgb(255, 0, 0, 0.0)">
                <v-container class="pa-0" fluid fill-height>
                    <v-layout>
                        <v-flex md9 class="mr-4">
                            <span class="display-2 mb-2 font-weight-bold white--text d-block">Лучшее.</span>
                            <span class="display-2 mb-2 font-weight-bold white--text d-block">Для вас.</span>
                            <span class="display-2 font-weight-bold white--text d-block">От FireX Proxy.</span>
                            <div class="text-xs-justify mt-2 subheading">
                                <p>
                                    Команда FireX Proxy более 5 лет разрабатывает и поддерживает продукт, который ежедневно заботится о вашей безопасности в интернете.
                                    В течение последних месяцев мы разработали экосистему, которая позволит вам получить самые <strong>надёжные и быстрые</strong> прокси-сервера.
                                </p>
                                <p>
                                    Мы представляем <strong>FireX Premium</strong>, в котором собраны наши лучшие прокси, а также представлен новый удобный интерфейс для их активации.
                                    Для нас <strong>крайне важна ваша поддержка</strong>, благодаря которой мы сможем и дальше развивать наш продукт в сложное для всех нас время.
                                    Лучшей поддержкой для нас будет приобретение подписки, стоимость которой составляет 120 рублей в месяц. Даже в случае, если вам достаточно бесплатной функциональности, но есть желание помочь нам.
                                </p>
                                <p class="mb-0">
                                    Подписка на FireX Premium — ваш <strong>бесценный вклад в развитие FireX Proxy</strong>.
                                </p>
                            </div>
                        </v-flex>
                        <v-flex md3>
                            <v-layout justify-end>
                                <v-img class="elevation-6" :src="require('@welcome/assets/screenshot-1.png')"></v-img>
                            </v-layout>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card>
            <v-timeline dense>
                <v-timeline-item class="mb-3" color="#ffd64e" small>
                    <v-card class="mx-auto elevation-17" dark color="#7d4eff">
                        <v-card-title>
                            <span class="title">FireX Premium</span>
                            <v-spacer></v-spacer>
                            <v-chip label color="white" text-color="black">
                                <v-icon left>date_range</v-icon> May 1, 2019
                            </v-chip>
                        </v-card-title>
                        <v-card-text class="subheading">
                            Лучшие и самые быстрые прокси-сервера, а также новый интерфейс доступны для подписчиков FireX Premium.
                        </v-card-text>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item class="mb-3" color="#ffd64e" small>
                    <v-card class="mx-auto elevation-17" dark color="#7d4eff">
                        <v-card-title>
                            <span class="title">Chrome Extension</span>
                            <v-spacer></v-spacer>
                            <v-chip label color="white" text-color="black">
                                <v-icon left>date_range</v-icon> Sep 1, 2018
                            </v-chip>
                        </v-card-title>
                        <v-card-text class="subheading">
                            FireX Proxy выпущен для браузеров на основе Chromium.
                        </v-card-text>
                    </v-card>
                </v-timeline-item>
                <v-timeline-item class="mb-3" color="#ffd64e" small>
                    <v-card class="mx-auto elevation-17" dark color="#7d4eff">
                        <v-card-title>
                            <span class="title">FireX Ecosystem</span>
                            <v-spacer></v-spacer>
                            <v-chip label color="white" text-color="black">
                                <v-icon left>date_range</v-icon> Aug 1, 2018
                            </v-chip>
                        </v-card-title>
                        <v-card-text class="subheading">
                            Новая экосистема FireX Proxy позволяет проверять работоспособность, анонимность, скорость прокси-серверов, а также предоставляет API для получения списка прокси-серверов.
                        </v-card-text>
                    </v-card>
                </v-timeline-item>
            </v-timeline>
        </v-container>
    </v-app>
</template>

<script>
    export default {
        name: 'App'
    }
</script>

<style scoped lang="scss">
    #app {
        background-color: #7d4eff;
    }
</style>

const permissions = { permissions: ['webRequest', 'webRequestBlocking'], origins: ['<all_urls>'] };

const acceptButton = document.querySelector('#request');
const cancelButton = document.querySelector("#cancel");

acceptButton.textContent = browser.i18n.getMessage('allow_permissions_button');
cancelButton.textContent = browser.i18n.getMessage('cancel_permissions_button');

document.querySelector('h3').textContent = browser.i18n.getMessage('prompt_header');
document.querySelector('h5').textContent = browser.i18n.getMessage('prompt_footer');

acceptButton.addEventListener('click', () => {
    browser.permissions.request(permissions).then(yes => {
        if (!yes) {
            return;
        }

        browser.runtime.sendMessage({ name: 'register-authentication'});
        window.close();
    });
});

cancelButton.addEventListener('click', () => window.close());

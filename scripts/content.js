//Language copied links should translate to, empty string keeps the original
let selectedLanguage = '';
chrome.storage.sync.get({ language: '' }, result => {
    selectedLanguage = result.language;
});
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.language) {
        selectedLanguage = changes.language.newValue || '';
    }
});

const BUTTON_CLASS = 'copy-link-button';
const CONTAINER_CLASS = 'copy-link-button-container';
const STATUS_RE = /^\/([^\/?#]+)\/status\/(\d+)/;

//Elements used to locate the post's action bar, checked in this order.
//New X layout: [data-engagement-action="like"]
//Old X layout: [data-testid="like"] and [data-testid="unlike"]
const ANCHOR_SELECTORS = [
    '[data-engagement-action="like"]',
    '[data-testid="like"]',
    '[data-testid="unlike"]',
    '[data-engagement-action]',
    '[data-testid="reply"]',
    '[data-testid="bookmark"]'
];


//Returns the post path (/user/status/ID) found inside the article
function getPostPath(article) {
    //The first /user/status/ID link in the article belongs to the post itself
    //(links like /analytics or /photo/1 are reduced to the base path by the regex)
    const links = article.querySelectorAll('a[href*="/status/"]');
    for (const a of links) {
        const m = (a.getAttribute('href') || '').match(STATUS_RE);
        if (m) return '/' + m[1] + '/status/' + m[2];
    }
    //If we're on the post's own page, fall back to the current URL
    const m = location.pathname.match(STATUS_RE);
    if (m) return '/' + m[1] + '/status/' + m[2];
    return null;
}


function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return legacyCopy(text);
}

//Fallback in case the Clipboard API is unavailable or blocked
function legacyCopy(text) {
    return new Promise((resolve, reject) => {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            ta.remove();
            ok ? resolve() : reject(new Error('execCommand copy failed'));
        } catch (e) {
            reject(e);
        }
    });
}


function createButton(article, group, anchorItem) {
    //Create the button element
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add(BUTTON_CLASS);
    button.innerText = 'FixUpX';
    Object.assign(button.style, {
        color: 'rgb(113, 118, 123)',
        backgroundColor: '#0000',
        border: '2px solid rgb(113, 118, 123)',
        borderRadius: '12px',
        fontFamily: 'TwitterChirp, system-ui, sans-serif',
        width: '65px',
        textAlign: 'center',
        verticalAlign: 'middle',
        cursor: 'pointer',
        height: '24px',
        fontWeight: '500',
        fontSize: '14px',
        padding: '0'
    });

    function buttonDefaultState() {
        button.innerText = 'FixUpX';
        button.style.color = 'rgb(113, 118, 123)';
        button.style.borderColor = 'rgb(113, 118, 123)';
    }

    function buttonSuccess() {
        button.innerText = 'Copied';
        button.style.color = '#0f0f';
        button.style.borderColor = '#0f0f';
        setTimeout(buttonDefaultState, 2000);
    }

    function buttonFailure(message) {
        button.innerText = 'Failed';
        button.style.color = '#f00f';
        button.style.borderColor = '#f00f';
        if (message) console.error('[fuX]', message);
        setTimeout(buttonDefaultState, 2000);
    }

    //Add an event listener for button click
    button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        //Read the link at click time, since React may have reused the DOM node
        const postPath = getPostPath(button.closest('article') || article);
        if (!postPath) {
            buttonFailure('Post link not found');
            return;
        }
        //Append the selected language so the embed translates the post
        let finalUrl = 'https://fixupx.com' + postPath;
        if (selectedLanguage) {
            finalUrl += '/' + selectedLanguage;
        }
        copyText(finalUrl).then(buttonSuccess).catch(buttonFailure);
    });

    //Create the buttonContainer element
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add(CONTAINER_CLASS);
    Object.assign(buttonContainer.style, {
        margin: 'auto',
        display: 'flex',
        flex: '1.25',
        justifyContent: 'flex-start',
        alignItems: 'center',
        minWidth: '70px'
    });
    buttonContainer.appendChild(button);

    //Place the container right after the anchor item in the action bar
    anchorItem.insertAdjacentElement('afterend', buttonContainer);
}


//Returns the direct child of the action bar that contains the given element
function getBarItem(group, element) {
    let item = element;
    while (item.parentElement && item.parentElement !== group) {
        item = item.parentElement;
    }
    return item.parentElement === group ? item : null;
}


function processArticle(article) {
    let anchor = null;
    for (const selector of ANCHOR_SELECTORS) {
        anchor = article.querySelector(selector);
        if (anchor) break;
    }
    if (!anchor) return;

    //The action bar is the [role="group"] that contains the anchor
    let group = anchor.closest('[role="group"]');
    let item = group ? getBarItem(group, anchor) : null;
    if (!group || !item) {
        item = anchor.parentElement;
        group = item ? item.parentElement : null;
    }
    if (!group || !item) return;

    //Exit if the button already exists in this action bar
    if (group.querySelector('.' + CONTAINER_CLASS)) return;

    createButton(article, group, item);
}


function scan() {
    document.querySelectorAll('article').forEach(processArticle);
}


//Batch DOM updates into a single scan per frame
let scanScheduled = false;
function scheduleScan() {
    if (scanScheduled) return;
    scanScheduled = true;
    requestAnimationFrame(() => {
        scanScheduled = false;
        try {
            scan();
        } catch (e) {
            console.error('[fuX]', e);
        }
    });
}

const observer = new MutationObserver(scheduleScan);
const config = { childList: true, subtree: true };
observer.observe(document.body, config);
scan();

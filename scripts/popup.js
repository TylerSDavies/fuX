//Languages supported by fixupx.com translations (the display languages of X itself)
const languages = [
    { code: 'ar', name: 'العربية' },
    { code: 'bg', name: 'Български' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ca', name: 'Català' },
    { code: 'cs', name: 'Čeština' },
    { code: 'da', name: 'Dansk' },
    { code: 'de', name: 'Deutsch' },
    { code: 'el', name: 'Ελληνικά' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'eu', name: 'Euskara' },
    { code: 'fa', name: 'فارسی' },
    { code: 'fi', name: 'Suomi' },
    { code: 'fil', name: 'Filipino' },
    { code: 'fr', name: 'Français' },
    { code: 'ga', name: 'Gaeilge' },
    { code: 'gl', name: 'Galego' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'he', name: 'עברית' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'hr', name: 'Hrvatski' },
    { code: 'hu', name: 'Magyar' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'it', name: 'Italiano' },
    { code: 'ja', name: '日本語' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ko', name: '한국어' },
    { code: 'mr', name: 'मराठी' },
    { code: 'ms', name: 'Bahasa Melayu' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'no', name: 'Norsk' },
    { code: 'pl', name: 'Polski' },
    { code: 'pt', name: 'Português' },
    { code: 'ro', name: 'Română' },
    { code: 'ru', name: 'Русский' },
    { code: 'sk', name: 'Slovenčina' },
    { code: 'sr', name: 'Српски' },
    { code: 'sv', name: 'Svenska' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'th', name: 'ไทย' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'uk', name: 'Українська' },
    { code: 'ur', name: 'اردو' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'zh-cn', name: '简体中文' },
    { code: 'zh-tw', name: '繁體中文' }
];


function getUserLanguage() {
    //Guess the user's X language from the browser language
    let code = (navigator.language || '').toLowerCase();
    if (code === 'zh' || code === 'zh-cn' || code === 'zh-hans') return 'zh-cn';
    if (code === 'zh-tw' || code === 'zh-hk' || code === 'zh-hant') return 'zh-tw';
    return code.split('-')[0];
}


function addOption(select, value, text) {
    const option = document.createElement('option');
    option.value = value;
    option.innerText = text;
    select.appendChild(option);
}


function buildLanguageList(select) {
    //Original comes first so the default behavior stays unchanged
    addOption(select, '', 'Original');
    //Then the user's own language if it's supported
    const userLanguage = getUserLanguage();
    const userEntry = languages.find(language => language.code === userLanguage);
    if (userEntry) {
        addOption(select, userEntry.code, userEntry.name);
    }
    //Everything else follows in alphabetical order
    languages.sort((a, b) => a.name.localeCompare(b.name));
    languages.forEach(language => {
        if (language.code !== userLanguage) {
            addOption(select, language.code, language.name);
        }
    });
}


const languageSelect = document.getElementById('languageSelect');
buildLanguageList(languageSelect);

//Load the saved language, empty means the post is embedded as-is
chrome.storage.sync.get({ language: '' }, result => {
    languageSelect.value = result.language;
});

languageSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ language: languageSelect.value });
});

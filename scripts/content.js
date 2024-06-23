function handleDOMUpdate(mutationsList, observer) {
    mutationsList.forEach(mutation => {
        //Check if a DOM update occured
        if (mutation.type === 'childList') {
            //Get all like buttons on page
            let likeButtons = [...document.querySelectorAll('[data-testid="like"]')];
            const unlikeButtons = [...document.querySelectorAll('[data-testid="unlike"]')];
            likeButtons = likeButtons.concat(unlikeButtons);
            //Create button after every like button if likeButtons isn't empty
            if (likeButtons.length > 0) {
                likeButtons.forEach(likeButton => createButton(likeButton));
            }
        }
    });
}


function buttonExistsAfter(targetElement) {
    // Get the next sibling of the targetElement
    const targetElementParent = targetElement.parentNode;
    let nextElement = targetElementParent.nextElementSibling;
    
    // Check if the next sibling has the class 'copy-link-button'
    if (nextElement && nextElement.classList.contains('copy-link-button-container')) {
        return true;
    }
    return false;
}


function getButtonLink(targetElement) {
    // Assuming targetElement is a <time> element, find its closest parent <article>
    const parentArticle = findParentArticle(targetElement);
    if (parentArticle) {
        // Query for the <time> element within the parent article
        const timeElement = parentArticle.querySelector('time');
        if (timeElement) {
            // Find the closest parent <a> element (assuming it contains the href attribute)
            const linkElement = timeElement.closest('a');
            if (linkElement) {
                // Retrieve the href attribute from the <a> element
                const targetUrl = linkElement.getAttribute('href');
                return targetUrl;
            } else {
                console.error('Parent <a> element not found for <time> element.');
            }
        } else {
            console.error('Child <time> element not found within parent <article>.');
        }
    } else {
        console.error('Parent <article> element not found for target element.');
    }
    return null; // Return null if any required elements are not found
}


function findParentArticle(targetElement) {
    let parent = targetElement.parentElement;
    
    while (parent) {
        if (parent.tagName.toLowerCase() === 'article') {
            return parent; // Return the <article> element once found
        }
        parent = parent.parentElement; // Move to the next parent element
    }
    return null;
}


function createButton(targetElement) {
    //Check if button exists after targetElement and exit if one does
    if (buttonExistsAfter(targetElement)) return;

    //Create the button element
    const button = document.createElement('button');
    button.classList.add('copy-link-button');
    button.innerText = 'FixUpX';
    button.style.color = 'rgb(113, 118, 123)';
    button.style.backgroundColor = '#0000';
    button.style.border = '2px solid rgb(113, 118, 123)';
    button.style.borderRadius = '12px';
    button.style.fontFamily = 'TwitterChirp';
    button.style.width = '65px';
    button.style.textAlign = 'center';
    button.style.verticalAlign = 'middle';
    button.style.cursor = 'pointer';
    button.style.height = '24px';
    button.style.fontWeight = '500';
    button.style.fontSize = '14px';


    //Add an event listener for button click
    button.addEventListener('click', () => {
        //Copy the current webpage URL to the clipboard
        const postUrl = getButtonLink(targetElement);
        const finalUrl = 'https://fixupx.com' + postUrl;
        navigator.clipboard.writeText(finalUrl)
            .then(() => {
                button.innerText = 'Copied';
                button.style.color = '#0f0f';
                button.style.borderColor = '#0f0f';
            })
            .catch(err => {
                button.innerText = 'Failed';
                button.style.color = '#f00f';
                button.style.borderColor = '#f00f';
            });
        setTimeout(() => {
            button.innerText = 'FixUpX';
            button.style.color = 'rgb(113, 118, 123)';
            button.style.borderColor = 'rgb(113, 118, 123)';
        }, 2000);
    });

    //Create the buttonContainer element
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('copy-link-button-container');
    buttonContainer.style.margin = 'auto';
    buttonContainer.appendChild(button);
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flex = '1.25';
    buttonContainer.style.justifyContent = 'flex-start';
    buttonContainer.style.minWidth = '70px';

    //Create buttonContainer after targetElement's parent
    const targetElementParent = targetElement.parentNode;
    targetElementParent.insertAdjacentElement('afterend', buttonContainer);
}


const observer = new MutationObserver(handleDOMUpdate);
const config = { childList: true, subtree: true };
observer.observe(document.body, config);
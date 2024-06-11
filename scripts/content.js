function handleDOMUpdate(mutationsList, observer) {
    mutationsList.forEach(mutation => {
        if (mutation.type === 'childList') {
            console.log('DOM updated');

            // Check if the button already exists on the page
            const existingButton = document.querySelector('#copyLinkButton');
            if (!existingButton) {
                // Create the button element
                const button = document.createElement('button');
                button.id = 'copyLinkButton';
                button.innerText = 'FixUpX';
                button.style.color = '#ffff';
                button.style.backgroundColor = '#0000';
                button.style.borderRadius = '10px';
                button.style.fontFamily = 'TwitterChirp';
                button.style.border = 'solid 0.5px #ffff';
                button.style.width = '65px';
                button.style.textAlign = 'center';
                button.style.cursor = 'pointer';

                // Add an event listener for button click
                button.addEventListener('click', () => {
                    // Copy the current webpage URL to the clipboard
                    const url = window.location.href;
                    const fixedUrl = url.replace("://x", "://fixupx")
                    navigator.clipboard.writeText(fixedUrl)
                        .then(() => {
                            button.innerText = 'Copied';
                            button.style.border = 'solid 0.5px #8f8f';
                        })
                        .catch(err => {
                            button.innerText = 'Failed';
                            button.style.border = 'solid 0.5px #f00f';
                        });
                    setTimeout(() => {
                        button.innerText = 'FixUpX';
                        button.style.border = 'solid 0.5px #ffff';
                    }, 2000);
                });

                // Select the target element to insert the button after
                const targetElement = document.querySelector('#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div.css-175oi2r.r-kemksi.r-1kqtdi0.r-1ua6aaf.r-th6na.r-1phboty.r-16y2uox.r-184en5c.r-1c4cdxw.r-1t251xo.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div > section > div > div > div:nth-child(1) > div > div > article > div > div > div:nth-child(3) > div.css-175oi2r.r-12kyg2d > div > div.css-175oi2r.r-1wbh5a2.r-1a11zyx');

                // Insert the button after the target element
                if (targetElement) {
                    targetElement.insertAdjacentElement('afterend', button);
                } else {
                    console.log('Target element not found');
                }
            } else {
                console.log('Button already exists on the page');
            }
        }
    });
}



const observer = new MutationObserver(handleDOMUpdate);
const config = { childList: true, subtree: true };

observer.observe(document.body, config);
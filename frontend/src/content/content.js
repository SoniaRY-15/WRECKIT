console.log("🚀 Extension aktif!");

console.log(document.title);
console.log(window.location.href);

const title = document.title;

console.log(title);

const currentUrl = window.location.href;

console.log(currentUrl);

function getPageData() {
    return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText.slice(0, 1000)
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "GET_PAGE_DATA") {
        sendResponse(getPageData());
    }

});
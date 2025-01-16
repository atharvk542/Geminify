import { GoogleGenerativeAI } from "@google/generative-ai";
require('dotenv').config();
const key = process.env.API_KEY;

// Detects for all content being loaded on page
document.addEventListener('DOMContentLoaded', function () {

    // Detects the "selectedText" being updated in the local storage from events.js
    chrome.storage.local.get('selectedText', async function (data) {
        // Sets up functionality for Gemini AI
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Detects the "type" being updated in the local storage from events.js
        chrome.storage.local.get('type', async function (moreData) {
            if (moreData.type === "explain") {
                // Calls AI with user's prompt
                const prompt = "Explain what this word or phrase means in under or around 200 words: " +
                    data.selectedText;
                const responseText = await run(data.selectedText, model, prompt);

                // Retrieves the div in the html for the AI output and updates it to contain the AI's output
                const textContainer = document.getElementById('text-container');
                textContainer.innerHTML = customFormatText(responseText);
            }

            else if (moreData.type === "input") {
                // Allows automatic resizing of the input box for the question
                const tx = document.getElementById("question");
                tx.addEventListener("input", OnInput, false);

                function OnInput() {
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + "px";
                }

                const form = document.getElementById('userInput');
                form.addEventListener('submit', async function (event) {
                    // Prevent the form from submitting the traditional way
                    event.preventDefault();

                    const formData = new FormData(form);
                    let input = String(formData.get('question'));

                    // Remove the textarea and button
                    const button = document.getElementById('button');
                    form.remove();
                    button.remove();

                    // Generates the card and the generating text animation
                    const card = document.createElement("div");
                    card.className = "mb-3 card";
                    card.id = "text-container";
                    const parentElement = document.getElementById("text-parent"); // Replace with the actual parent element ID
                    parentElement.appendChild(card);

                    const generating = document.createElement('p');
                    generating.className = 'mx-3 mt-3';
                    generating.style.display = 'inline-block';
                    generating.textContent = 'Generating';
                    const spanElement = document.createElement('span');
                    spanElement.className = 'dots';
                    generating.appendChild(spanElement);
                    card.appendChild(generating);


                    // Cleans up input, creates prompt and waits for AI response
                    const prompt = input + ":" + data.selectedText;
                    const responseText = await run(data.selectedText, model, prompt);

                    // Retrieves the div in the html for the AI output and updates it to contain the AI's output
                    const textContainer = document.getElementById('text-container');
                    textContainer.innerHTML = customFormatText(responseText);

                    // Generates the redo button
                    const redo = document.createElement("button");
                    redo.id = 'redo';
                    redo.textContent = "Ask again";
                    redo.className = "button-style";
                    const redoParent = document.getElementById("redo-parent");
                    redoParent.appendChild(redo);
                    
                    resetInputHandler();
                });
            }
        });

        // Waits for the window to come out of focus (for the user to click off) and closes the window
        chrome.storage.local.get("autoclose", function (data) {
            if(data.autoclose) {
                window.addEventListener('blur', function () {
                    setTimeout(closePopup, 15);
                });
            }
        });
    });
});

// Gives the prompt to Gemini AI and returns a text output
async function run(input, model, prompt) {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return text;
}

// Formats AI text output to insert newlines and have bolded / italicized text
function customFormatText(text) {
    let formattedText = text;

    // Insert newlines
    formattedText = formattedText.replace(/\n/g, '<br>');

    // Convert `**text**` to `<strong>text</strong>`
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert ASCII 149 to bullet
    formattedText = formattedText.replace(/\*/g, "&#149;");

    // Insert <p> tags at start and end of text, allowing use of bootstrap spacing classes
    formattedText = `<p class='mx-3 mt-3'>${formattedText}</p>`;

    return formattedText;
}

// Function to close the popup
function closePopup() {
    chrome.windows.getCurrent(function (window) {
        if (window.type === 'popup') {
            chrome.windows.remove(window.id);
        }
    });
}

// Remakes the window and resets local storage to activate the input handler again
function resetInputHandler() {
    chrome.storage.local.set({ 'type': 'temp' });
    chrome.storage.local.set({ 'type': 'input' });

    chrome.windows.create({
        url: chrome.runtime.getURL("popups/inputpopup.html"),
        type: "popup",
        width: 600,
        height: 400
    });
}


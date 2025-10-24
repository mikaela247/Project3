const breedSelect = document.getElementById("breed-select");
const imageContainer = document.getElementById("image-container");

// Fetch list of breeds
fetch("https://dog.ceo/api/breeds/list/all")
  .then((res) => res.json())
  .then((data) => {
    const breeds = Object.keys(data.message);
    breeds.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed;
      option.textContent = breed.charAt(0).toUpperCase() + breed.slice(1);
      breedSelect.appendChild(option);
    });
  })
  .catch((error) => {
    console.error(error);
    showError("Could not load breed list. Please try again later.");
  });

// Handle breed selection
breedSelect.addEventListener("change", () => {
  const selectedBreed = breedSelect.value;
  if (!selectedBreed) return;

  //Fetch images depends on the selected breed
  fetch(`https://dog.ceo/api/breed/${selectedBreed}/images`)
    .then((res) => res.json())
    .then((data) => {
      imageContainer.innerHTML = "";
      data.message.forEach((imgUrl) => {
        const card = document.createElement("div");
        card.className = "card";
        const img = document.createElement("img");
        img.src = imgUrl;
        card.appendChild(img);
        imageContainer.appendChild(card);
      });
    })
    .catch((error) => {
      console.error(error);
      showError("Failed to load images. Please try again.");
    });
  getAiResponse(selectedBreed);
});

// This manages the visibility of the AI assistant UI based on screen size.
document.addEventListener("DOMContentLoaded", function () {
  const aiContainer = document.getElementById("ai-container");
  const closeBtn = document.getElementById("close-btn");
  const aiIcon = document.getElementById("ai-icon");

  function isSmallScreen() {
    return window.innerWidth <= 1400;
  }

  function updateAiVisibility() {
    if (isSmallScreen()) {
      aiContainer.classList.add("hidden");
      aiIcon.style.display = "flex";
      closeBtn.style.display = "block";
    } else {
      aiContainer.classList.remove("hidden");
      aiIcon.style.display = "none";
      closeBtn.style.display = "none";
    }
  }

  aiIcon.addEventListener("click", () => {
    aiContainer.classList.remove("hidden");
    aiIcon.style.display = "none";
  });
  closeBtn.addEventListener("click", () => {
    aiContainer.classList.add("hidden");
    aiIcon.style.display = "flex";
  });

  window.addEventListener("resize", updateAiVisibility);
  updateAiVisibility();
});

// This function displays a formatted message in the AI assistant chat container.
function displayMessage(message) {
  const container = document.getElementById("ai-messages");
  container.innerHTML = "";
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");

  let formatted = message.trim();

  // Remove bold asterisks and wrap in <strong>
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    (_, text) => `<strong>${text}</strong>`
  );

  // Convert Markdown bullets (*) to <li> items
  formatted = formatted.replace(/^\* (.*)/gm, "<li>$1</li>");

  // Wrap list items in <ul> if any exist
  if (formatted.includes("<li>")) {
    formatted = formatted.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
  }

  formatted = formatted.replace(
    /^(.+?)\n/,
    (match) => `<strong>${match.toUpperCase()}</strong>`
  );
  formatted = formatted.replace(
    /(key traits:)/i,
    (match) => `<strong>${match.toUpperCase()}</strong>`
  );
  formatted = formatted.replace(
    /(fun fact:)/i,
    (_, text) => `<strong>${text.toUpperCase()}</strong><br>`
  );

  // Convert double newlines to paragraph breaks
  formatted = formatted.replace(/\n{2,}/g, "<br><br>");

  // Convert single newlines to line breaks
  formatted = formatted.replace(/\n/g, "<br>");

  messageElement.innerHTML = formatted;
  container.appendChild(messageElement);
  container.scrollTop = container.scrollHeight;
}

//Use the Gemini API to retrieve information about the selected breed.
async function getAiResponse(selectedBreed) {
  try {
    const response = await fetch(
      `/api/getBreedInfo?selectedBreed=${encodeURIComponent(selectedBreed)}`
    );
    const data = await response.json();
    displayMessage(data.message);
  } catch (error) {
    console.error("Error:", error);
    displayMessage("No response at the moment. Please retry.");
  }
}

document.getElementById("find-restaurants").addEventListener("click", () => {
  const location = document.getElementById("search-input").value.trim();
  if (location) {
    fetchLocationCoordinates(location);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      showRestaurantsByPosition,
      showError
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

function fetchLocationCoordinates(location) {
  const nominatimEndpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${location}`;

  fetch(nominatimEndpoint)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const { lat, lon } = data[0];
        fetchRestaurants(lat, lon);
      } else {
        alert("Location not found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching location data from Nominatim:", error);
    });
}

function showRestaurantsByPosition(position) {
  const { latitude, longitude } = position.coords;
  fetchRestaurants(latitude, longitude);
}

function fetchRestaurants(latitude, longitude) {
  const overpassEndpoint = `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=restaurant](around:5000,${latitude},${longitude});out;`;

  fetch(overpassEndpoint)
    .then((response) => response.json())
    .then((data) => {
      const restaurants = data.elements;
      const restaurantsContainer = document.getElementById("restaurants");
      restaurantsContainer.innerHTML = ""; // Clear previous results

      if (restaurants.length === 0) {
        restaurantsContainer.innerHTML =
          "<p>No se encontraron restaurantes cerca.</p>";
        return;
      }

      restaurants.forEach((restaurant) => {
        const card = document.createElement("div");
        card.className = "restaurant-card";

        // Create the card content
        card.innerHTML = `
                    <img src="src/food.png" alt="Comida">
                    <div>
                        <a href="https://www.openstreetmap.org/?mlat=${restaurant.lat}&mlon=${restaurant.lon}" target="_blank" rel="noopener noreferrer">
                            <h2>${restaurant.tags.name || "Restaurante sin nombre"}</h2>
                        </a>
                        <p>${restaurant.tags.cuisine || "Cocina no especificada"}</p>
                        <p>Lat: ${restaurant.lat}, Lon: ${restaurant.lon}</p>
                    </div>
                `;

        // Append the card to the container
        restaurantsContainer.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error al obtener datos de Overpass API:", error);
    });
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("El usuario denegó la solicitud de geolocalización.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("La información de ubicación no está disponible");
      break;
    case error.TIMEOUT:
      alert(
        "Se agotó el tiempo de espera de la solicitud para obtener la ubicación del usuario."
      );
      break;
    case error.UNKNOWN_ERROR:
      alert("Se produjo un error desconocido.");
      break;
  }
}

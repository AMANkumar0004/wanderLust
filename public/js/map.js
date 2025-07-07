mapboxgl.accessToken = mapToken;

  
  
  const map = new mapboxgl.Map({
    container:"map",  //container ID
    //choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style:"mapbox://styles/mapbox/streets-v12",
    center:listing.geometry.coordinates, // starting position[lng,lat]
    zoom:9, //starting zoom
  });




  const marker = new mapboxgl.Marker({color:"red"})
  .setLngLat(listing.geometry.coordinates)   //listing .geometry.coordinates
  .setPopup(new mapboxgl.Popup({offset: 25}).setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`))
  .addTo(map);

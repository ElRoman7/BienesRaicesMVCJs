(function() { //funcion que se llama a sí misma
    const lat = document.querySelector('#lat').value || 20.67444163271174;    
    const lng = document.querySelector('#lng').value || -103.38739216304566;    
    const mapa = L.map('mapa').setView([lat, lng ], 14);
    let marker;
    
    // Utilizar provider y geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Añadir pin
    marker = new L.marker([lat,lng],{
        draggable: true,
        autoPan: true
    })
    .addTo(mapa)

    // Detectar la ubicacion del pin
    marker.on('moveend', function(event){
        marker = event.target;

        const posicion = marker.getLatLng();
        // console.log(posicion);

        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

        //Obtener informacion de las calles al soltar el pin
        geocodeService.reverse().latlng(posicion, 14).run(function(error, resultado){
            // console.log(resultado);

            marker.bindPopup(resultado.address.LongLabel)
            // console.log(resultado);
            

            // Llenar los campos
            document.querySelector('.calle').textContent = resultado?.address?.LongLabel ?? '';
            document.querySelector('#calle').value = resultado?.address?.LongLabel ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
            
        })
    })


})()

for(let i=0; i<10000; i++){
    fetch('http://localhost:3000/bulkhead', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(async (res) => console.log({
        statusText: res.statusText,
        body: await res.json()
    }))
}
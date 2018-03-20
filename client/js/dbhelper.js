class DBHelper{static get DATABASE_URL(){return`http://localhost:${1337}/restaurants`}static serviceWorker(){navigator.serviceWorker&&navigator.serviceWorker.register('/sw.js').then(function(){console.log('Registration worked!')}).catch(function(){console.log('Registration failed!')})}static fetchRestaurants(a){const b=new IndexedDB;b.getFromDB(a).then(()=>{fetch(DBHelper.DATABASE_URL).then((c)=>{c.json().then((c)=>{c?(b.putRestaurantsToDB(c),a(null,c)):a('Restaurant does not exist',null)})}).catch((b)=>{a(b,null)})})}static fetchReviews(){const a=new IndexedDB;fetch('http://localhost:1337/reviews/').then((b)=>{b.json().then((b)=>{b?a.putReviewsToDB(b):console.error('Reviews does not exist in the database')})}).catch((a)=>{console.error(a)})}static fetchRestaurantById(a,b){const c=new IndexedDB;c.getRestaurantFromDBbyId(a).then((c)=>c?void b(null,c):void fetch(`http://localhost:1337/restaurants/${a}`).then((a)=>{a.json().then((a)=>{a?b(null,a):b('Restaurant does not exist',null)})}).catch((a)=>{b(a,null)}))}static fetchReviewsByRestaurantId(a,b){const c=new IndexedDB;c.getReviewsFromDBbyRestaurantId(a).then((d)=>0<d.length?void b(null,d):void fetch(`http://localhost:1337/reviews/?restaurant_id=${a}`).then((a)=>{a.json().then((a)=>{a?(c.putReviewsToDB(a),b(null,a)):b('Reviews does not exist',null)})}).catch((a)=>{b(a,null)}))}static fetchRestaurantByCuisine(a,b){DBHelper.fetchRestaurants((c,d)=>{if(c)b(c,null);else{const c=d.filter((b)=>b.cuisine_type==a);b(null,c)}})}static fetchRestaurantByNeighborhood(a,b){DBHelper.fetchRestaurants((c,d)=>{if(c)b(c,null);else{const c=d.filter((b)=>b.neighborhood==a);b(null,c)}})}static fetchRestaurantByCuisineAndNeighborhood(a,b,c){DBHelper.fetchRestaurants((d,e)=>{if(d)c(d,null);else{let d=e;'all'!=a&&(d=d.filter((b)=>b.cuisine_type==a)),'all'!=b&&(d=d.filter((a)=>a.neighborhood==b)),c(null,d)}})}static fetchNeighborhoods(a){DBHelper.fetchRestaurants((b,c)=>{if(b)a(b,null);else{const b=c.map((a,b)=>c[b].neighborhood),d=b.filter((a,c)=>b.indexOf(a)==c);a(null,d)}})}static fetchCuisines(a){DBHelper.fetchRestaurants((b,c)=>{if(b)a(b,null);else{const b=c.map((a,b)=>c[b].cuisine_type),d=b.filter((a,c)=>b.indexOf(a)==c);a(null,d)}})}static addFavoriteRestaurant(a,b){const c=new IndexedDB;c.toggleFavoriteRestaurantInDB(a,b).then(()=>{fetch(`http://localhost:1337/restaurants/${a}/`,{method:'PUT',body:JSON.stringify({is_favorite:b})}).then((a)=>{console.log(a)}).catch((a)=>{console.error(a)})})}static postSubmittedReview(a){if(!a)return;const b=new IndexedDB;return b.postSubmittedReviewToDB(a).then(()=>navigator.onLine?void fetch(`http://localhost:1337/reviews`,{method:'POST',body:JSON.stringify(a),headers:{"Content-Type":'application/json'}}).then((a)=>(b.deleteSubmittedReviewsFromDB(),a.json())).catch((a)=>{console.error(a)}).then((a)=>{b.putReviewToDB(a)}):void(DBHelper.offlineMessage(),setTimeout(()=>{DBHelper.postSubmittedReview(a)},5e3)))}static postReviewsFromDB(){const a=new IndexedDB;a.checkSubmittedReviewsInDB().then((b)=>{0===b.length||b.forEach((b)=>{fetch(`http://localhost:1337/reviews`,{method:'POST',body:JSON.stringify(b),headers:{"Content-Type":'application/json'}}).then((b)=>(a.deleteSubmittedReviewsFromDB(),b.json())).catch((a)=>{console.error(a)}).then((b)=>{a.putReviewToDB(b)})})})}static urlForRestaurant(a){return`./restaurant.html?id=${a.id}`}static imageUrlForRestaurant(a){return`/client/img/${a.photograph}.jpg`}static mapMarkerForRestaurant(a,b){const c=new google.maps.Marker({position:a.latlng,title:a.name,url:DBHelper.urlForRestaurant(a),map:b,animation:google.maps.Animation.DROP});return c}static offlineMessage(){if(navigator.onLine){let a=document.getElementsByClassName('offline-message');return void(a[0]&&a[0].remove())}const a=document.getElementsByTagName('body');let b=document.createElement('section');b.className='offline-message',b.innerHTML='Unable to connect. Your review would be submitted after re-connection',a[0].appendChild(b)}}class IndexedDB extends DBHelper{openDatabase(){return navigator.serviceWorker?idb.open('restaurants-db',1,function(a){a.createObjectStore('restaurants',{keyPath:'id'}),a.createObjectStore('reviews',{keyPath:'id',autoIncrement:!0}).createIndex('restaurant_id','restaurant_id'),a.createObjectStore('submitted',{autoIncrement:!0})}):Promise.resolve()}putRestaurantsToDB(a){return this.openDatabase().then(function(b){if(!b)return;let c=b.transaction('restaurants','readwrite'),d=c.objectStore('restaurants');a.forEach(function(a){d.put(a)})})}putReviewsToDB(a){return this.openDatabase().then(function(b){if(!b)return;let c=b.transaction('reviews','readwrite'),d=c.objectStore('reviews');a.forEach(function(a){d.put(a)})})}putReviewToDB(a){return this.openDatabase().then(function(b){if(b){let c=b.transaction('reviews','readwrite'),d=c.objectStore('reviews');d.put(a)}})}postSubmittedReviewToDB(a){return this.openDatabase().then(function(b){if(b){let c=b.transaction('submitted','readwrite'),d=c.objectStore('submitted');return d.put(a)}})}deleteSubmittedReviewsFromDB(){return this.openDatabase().then(function(a){if(a){let b=a.transaction('submitted','readwrite'),c=b.objectStore('submitted');return c.openCursor()}}).then(function a(b){if(b)return b.delete(),b.continue().then(a)})}checkSubmittedReviewsInDB(){return this.openDatabase().then((a)=>{if(a){let b=a.transaction('submitted'),c=b.objectStore('submitted');return c.getAll()}})}toggleFavoriteRestaurantInDB(a,b){return this.openDatabase().then((b)=>{if(b){let c=b.transaction('restaurants','readwrite');return c.objectStore('restaurants').openCursor(parseInt(a))}}).then((a)=>{if(a){let c=a.value;return c.is_favorite=b,a.update(c)}})}getFromDB(a){return this.openDatabase().then((b)=>{if(b){let c=b.transaction('restaurants').objectStore('restaurants');return c.getAll().then((b)=>{a(null,b)})}})}getRestaurantFromDBbyId(a){return this.openDatabase().then((b)=>{let c=b.transaction('restaurants').objectStore('restaurants');return c.get(parseInt(a))})}getReviewsFromDBbyRestaurantId(a){return this.openDatabase().then((b)=>{let c=b.transaction('reviews').objectStore('reviews').index('restaurant_id');return c.getAll(parseInt(a))})}}
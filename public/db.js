let db;

const request = indexedDB.open("budget",2);

request.onupgradeneeded = function (e) {
    const db = e.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

const checkDatabase = () => {
  console.log('check db invoked');

  const transaction = db.transaction(["pending"], "readwrite");

  const store = transaction.objectStore("pending");

  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const currentStore = transaction.objectStore("pending");
          currentStore.clear();
        });
    }
  };
}

request.onsuccess = function (e) {
  db = e.target.result;

  if (navigator.onLine){
    console.log('Backend online! 🗄️');
    checkDatabase();
  }
};
request.onerror = function(e){
  console.log("Woops!" + e.target.errorCode);
};

const saveRecord = (record) => {
  console.log('Save record invoked');
  const transaction = db.transaction(["pending"], "readwrite");

  const store = transaction.objectStore("pending");

  store.add(record);
};

window.addEventListener("online", checkDatabase);
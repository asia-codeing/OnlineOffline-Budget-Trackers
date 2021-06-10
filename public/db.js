let db;

// Create a new db request for a "budget" database.
const request = indexedDB.open('budget',1);

request.onupgradeneeded = function (e) {
  const db = e.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (e) {
  db = e.target.result;

  if (navigator.onLine){
    checkDatabase();
  }
};
request.onerror = function(e){
  console.log("Woops!" + e.target.errorCode);
};

const saveRecord = (record) => {
  console.log('Save record invoked');
  // Create a transaction on the BudgetStore db with readwrite access
  const transaction = db.transaction(["pending"], 'readwrite');

  // Access your BudgetStore object store
  const store = transaction.objectStore("pending");

  // Add record to your store with add method.
  store.add(record);
};


function checkDatabase() {
  console.log('check db invoked');

  // Open a transaction on your BudgetStore db
  let transaction = db.transaction(["pending"], 'readwrite');

  // access your BudgetStore object
  const store = transaction.objectStore("pending");

  // Get all records from store and set to a variable
  const getAll = store.getAll();

  // If the request was successful
  getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online
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
          const transaction = db.transaction(["pending"], readwrite);
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}
// Listen for app coming back online
window.addEventListener('online', checkDatabase);
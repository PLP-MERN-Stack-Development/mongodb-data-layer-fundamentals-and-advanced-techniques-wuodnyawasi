// Import MongoDB client
const { MongoClient } = require('mongodb');

// Connection URI 
const uri = 'mongodb://localhost:27017';

// Database and collection names
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function run() {
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();

    // Access the database and collection
    const db = client.db(dbName);
    const books = db.collection(collectionName);

    // TASK 2

    // Query 1: find all books in a specific genre

    const t2q1 = await books.find(
        {}, { genre: "Fiction"}
    ).toArray();

    console.log("queryt2q1: ", t2q1);

    // Query 2: find books published after a certain year

    const t2q2 = await books.find({published_year: { $gt: 1959}
    }).toArray();
    console.log(" queryt2q2: ", t2q2);


    // Query 3: find books by a specific author

    const t2q3 = await books.find(
        { author: "George Orwell"}
    ).toArray();
    console.log("query t2q3: ", t2q3);


    // Query 4: update price of a specific book

    const t2q4 = await books.updateOne(
        { title: "Brave New World"}, {$set: { price: 15.0}}
    )
    console.log("query t2q4: ", t2q4);

    //Query 5: delete a book by its title

    const t2q5 = await books.deleteOne(
        { title: "To Kill a Mockingbird"}
    )
    console.log("query t2q5: ", t2q5);

    // TASK 3 : Advanced queries

    // //  QUERY 1: Books in stock and published after 2010

    const t3q1 = await books.find({
      in_stock: true,
      publish_year: { $gt: 2010 }
    }).toArray();

    console.log("Query t3q1:", t3q1);

    // //  Query 2: using projections

    const t3q2 = await books.find(
        {}, { projection: {title: 1, author: 1, price: 1, _id: 0 }}).toArray();

        console.log("query t3q2:", t3q2);

    
    //Query 3: sorting asc and desc

    const t3q3 = await books.find().sort(
        { price: 1}
    ).toArray();

    console.log("query t3q3: ", t3q3);

    

    // Query 4: use limit and skip

    const t3q4 = await books.find().skip(4).limit(5).toArray();

    console.log("query t3q4: ", t3q4);

    // task 4: Aggregations

    // Query 1: avarage by genre

    const t4q1 = await books.aggregate([
      {
        $group: {
        _id: "$genre",
        averagePrice: { $avg: "$price" }
      }
    },
    {
    $sort: { averagePrice: -1 } 
    }
    ]).toArray(); 

  console.log("query t4q1: ", t4q1); 

  // Query 2: author with the most books

      const t4q2 = await books.aggregate([
      {
        $group: {
          _id: "$author",
          bookCount: { $sum: 1 }
        }
      },
      {
        $sort: { bookCount: -1 }
      },
  
    ]).toArray();

    console.log("query :", t4q2);

    //Query 3: publication decade

          const t4q3 = await books.aggregate([
        {
          $addFields: {
            decade: {
              $multiply: [
                { $floor: { $divide: ["$published_year", 10] } },
                10
              ]
            }
          }
        },
        {
          $group: {
            _id: "$decade",
            bookCount: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 } // Sort by decade (ascending)
        }
      ]).toArray();

      console.log("query t4q3", t4q3);


      // TASK 5 : Indexing

      // Query 1

      const t5q1 = await books.createIndex({ title: 1 })

      console.log("query t5q1: ", t5q1);


      //Query 2

      const t5q2 = await books.createIndex({ author: 1, published_year: -1 })

        console.log("query t5q2: ", t5q2);


        // Query 3

       // BEFORE creating index
        const t5q3a = await books.find({ title: "The Hobbit" }).explain("executionStats");
        console.log("Before index:", t5q3a.executionStats);

        // CREATE index
        const t5q3b = await books.createIndex({ title: 1 });
        console.log("Index created:", t5q3b); // This will show the index name

        // AFTER creating index
        const t5q3c = await books.find({ title: "The Hobbit" }).explain("executionStats");
        console.log("After index:", t5q3c.executionStats);




  } catch (error) {
    console.error("Error running query:", error);
  } finally {
    await client.close();
  }
}

// Run the function
run();
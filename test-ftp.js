
const ftp = require("basic-ftp")

async function example() {
    const client = new ftp.Client()
    // client.ftp.verbose = true
    try {
        await client.access({
            host: "212.30.195.77",
            user: "upload",
            password: "uploadftp1",
            secure: false
        })
        console.log("Login successful")
        await client.cd("Magnusson")
        const list = await client.list()
        const file = list.find(f => f.name === "Playlist XML.xml")
        if (file) {
            console.log("File Info:", JSON.stringify(file, null, 2))
        } else {
            console.log("File not found")
        }
    }
    catch (err) {
        console.log(err)
    }
    client.close()
}

example()

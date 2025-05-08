const express = require("express");
const path = require('path');

const fs = require("fs");
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');



app.get('/', (req, res) => {
    fs.readdir('./files', (err, filenames) => {
        if (err) throw err;

        const files = filenames.map((filename) => {
            const content = fs.readFileSync(path.join('./files', filename), 'utf8');
            return {
                title: filename.replace('.txt', ''), // remove .txt extension
                content: content
            };
        });
        res.render('home', { files }); // ✅ Pass array of objects with name + content
    });
});


app.post('/create', (req, res) => {
    const fileName = req.body.title.split(' ').join('') + '.txt';
    fs.writeFile(`./files/${fileName}`, req.body.content, (err) => {
        if (err) throw err;

        // ✅ Read all files again with proper structure
        fs.readdir('./files', (err, filenames) => {
            if (err) throw err;

            const files = filenames.map((filename) => {
                const content = fs.readFileSync(path.join('./files', filename), 'utf8');
                return {
                    title: filename,
                    content: content
                };
            });

            res.render('home', { files }); // ✅ Now it has title and content
        });
    });
});

app.post('/delete/:fileName', (req, res) => {
    const filePath = path.join(__dirname, 'files', req.params.fileName);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Delete error:", err);
            return res.status(500).send("File not found or cannot delete");
        }
        res.redirect('/');
    });
});



app.listen(3000, () => {
    console.log("its running");
});
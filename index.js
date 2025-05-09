const express = require("express");
const path = require('path');

const fs = require("fs");
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
// app.use(express.urlencoded({ extended: true }));



app.get('/', (req, res) => {
    fs.readdir('./files', (err, filenames) => {
        if (err) throw err;

        const files = filenames.map((filename) => {
            const content = fs.readFileSync(path.join('./files', filename), 'utf8');
            return {
                title: filename.replace('.txt', ''),
                content: content
            };
        });
        res.render('home', { files });
    });
});

app.get("/show/:filename", (req, res) => {
    fs.readFile(`./files/${req.params.filename}.txt`, 'utf-8', (err, datacontent) => {
        res.render('show', {
            filename: req.params.filename,
            content: datacontent
        });
    })
})
app.get("/edit/:filename", (req, res) => {
    const filename = req.params.filename;
    console.log("old name ", filename);

    res.render('edit', { filename });
})

app.post("/edit/:filename", (req, res) => {
    const oldName = req.params.filename + '.txt';
    console.log(oldName);
    const newName = req.body.newtitle.split(' ').join('') + '.txt';
    console.log(newName);
    const oldPath = path.resolve('files', oldName);
    const newPath = path.resolve('files', newName);

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.log("Rename failed :", err);
            return res.status(500).send("Rename Failed :");
        }
        res.redirect('/');
    });
});
app.post('/create', (req, res) => {
    const fileName = req.body.title.split(' ').join('') + '.txt';
    console.log("filename", fileName);
    fs.writeFile(`./files/${fileName}`, req.body.content, (err) => {
        if (err) throw err;

        fs.readdir('./files', (err, filenames) => {
            if (err) throw err;

            const files = filenames.map((filename) => {
                const content = fs.readFileSync(path.join('./files', filename), 'utf8');
                return {
                    title: filename.replace('.txt', ''),
                    content: content
                };
            });

            res.render('home', { files });
        });
    });
});

app.post('/delete/:fileName', (req, res) => {
    const filePath = path.join(__dirname, 'files', req.params.fileName) + '.txt';
    console.log("path from delete ", filePath);
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
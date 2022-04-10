const { src, dest, watch, series, parallel } = require("gulp");
const browserSync = require("browser-sync").create();
const del = require("del");

//html
const fileInclude = require("gulp-file-include");
const htmlMin = require("gulp-htmlmin");
const webpHtml = require("gulp-webp-html");

//scss css sass
const sass = require('gulp-sass')(require("sass"));
sass.compiler = require("node-sass");
const csso = require("gulp-csso");
const concat = require("gulp-concat");
const groupMediaQueries = require("gulp-group-css-media-queries");
const sassGlob = require("gulp-sass-glob");
const cssimport = require("gulp-cssimport");
const webpCss = require("gulp-webp-css");

//js
const babel = require("gulp-babel");
const webpack = require("webpack-stream");

//images
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const webp = require("gulp-webp");

//font
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");


//tasks
const clean = () => {
    return del("./public");
}

const html = () => {
    return src("./src/**/*.html")
        .pipe(fileInclude())
        .pipe(htmlMin({
            collapseWhitespace: true
        }))
        .pipe(webpHtml())
        .pipe(dest("./public"))
        .pipe(browserSync.stream());
}

const scss = () => {
    return src("./src/**/*.scss")
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(concat("main.css"))
        .pipe(cssimport())
        .pipe(webpCss())
        .pipe(groupMediaQueries())
        .pipe(dest("./public"))
        .pipe(csso())
        .pipe(dest("./public"))
        .pipe(browserSync.stream());
}

const js = () => {
    return src("./src/**/*.js")
        .pipe(babel())
        .pipe(webpack({
            mode: "development"
        }))
        .pipe(dest("./public"))
        .pipe(browserSync.stream());
}

const img = () => {
    return src("./src/img/*.{png,jpg,jpeg,gif,svg}")
        .pipe(newer("./public"))
        .pipe(webp())
        .pipe(dest("./public/img/"))
        .pipe(src("./src/img/*.{png,jpg,jpeg,gif,svg}"))
        .pipe(newer("./public/img/"))
        .pipe(imagemin())
        .pipe(dest("./public/img/"))
        .pipe(browserSync.stream());
}

const font = () => {
    return src("./src/font/*.{eot,ttf,otf,otc,ttc,woff,woff2,svg}")
        .pipe(newer("./public/font"))
        .pipe(fonter({
            formats: ["ttf", "woff", "eot", "svg"]
        }))
        .pipe(dest("./public/font"))
        .pipe(ttf2woff2())
        .pipe(dest("./public/font"))
        .pipe(browserSync.stream());
}

const server = () => {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
}

const watcher = () => {
    watch("./src/**/*.html", html);
    watch("./src/**/*.scss", scss);
    watch("./src/**/*.js", js);
    watch("./src/img/*.{png,jpg,jpeg,gif,svg}", img);
    watch("./src/font/*.{eot,ttf,otf,otc,ttc,woff,woff2,svg}", font);
}

const build = series(
    clean,
    parallel(html, scss, js, img, font)
);

const dev = series(
    build,
    parallel(watcher, server)
);

exports.clean = clean;
exports.html = html;
exports.scss = scss;
exports.js = js;
exports.img = img;
exports.font = font;
exports.watch = watcher;

exports.dev = dev;
exports.build = build;
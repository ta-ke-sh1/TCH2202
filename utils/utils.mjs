import moment from 'moment';

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCurrentDateAsFirestoreFormat() {
    return moment().format("YYYY-MM-D");
}

function getCurrentDateAsDBFormat() {
    return moment().format("YYYY/MM/D");
}

function convertStringToArray(input) {
    if (input.startsWith("[")) {
        input = input.substring(1, input.length);
    }
    if (input.endsWith("]")) {
        input = input.substring(0, input.length - 1);
    }
    return input.split(",");
}

export { getRndInteger, getCurrentDateAsDBFormat, convertStringToArray, getCurrentDateAsFirestoreFormat };

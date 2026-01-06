let viewbox = SVG().addTo('body').size(105, 25).id('spartak');
let defs = viewbox.defs();
let smallActive = viewbox.group().attr({ id: 'Layer_2', class: 'small-active', 'data-name': 'Layer_2' });
let sector = smallActive.group().id('nameSector');

let arrWidth = [105]; // в массив собирается длины всех рядов, 105 минимальная ширина вьюпорта
let arrHistory = [];

let numbers = sector.group().id('numbers'); // группа для нумерации
let field = sector.group().id('field'); // группа для обозначения поля

let s = 14; // размер места (size)
let m = 6; // отступ между местами (margin)


function changeTextSize () { // изменение размера шрифта в местах, управляется селекторов 1+/100+
    let sel = document.getElementById('changeTextSize').selectedIndex;
    let options = document.getElementById('changeTextSize').options;
    let style = document.querySelector('defs').querySelector('style');
    style.innerHTML = `.cls-1 {fill: #ededed; stroke: #bbb; stroke-width: 0.6px;} .cls-2 {font-family: ArialMT, Arial; font-size: ${options[sel].value}px; fill: #9e9e9e;} .cls-3 {font-family: ArialMT, Arial; font-size: 12px;}`;
    applyAll();
};


let direction = document.getElementById('changeDirection').selectedIndex; // направление мест на схеме. 0 = straight, 1 = reverse
function changeDirection () {
    let sel = document.getElementById('changeDirection').selectedIndex;
    direction = sel;
    applyAll();
}


defs.style(`.cls-1 {fill: #ededed; stroke: #bbb; stroke-width: 0.6px;} .cls-2 {font-family: ArialMT, Arial; font-size: ${document.getElementById('changeTextSize').value}px; fill: #9e9e9e;} .cls-3 {font-family: ArialMT, Arial; font-size: 12px;}`);
let defsPattern = document.querySelector('defs');
let pattern = `<pattern id="cross" data-name="cross" width="1" height="1"> <rect class="cls-901" width="${s}" height="${s}" /> <rect class="cls-902" width="${s}" height="${s}" /> <polyline class="cls-903" transform="translate(0 0)" points="3 3 13 13" /> <polyline class="cls-903" transform="translate(0 0)" points="3 13 13 3" /> </pattern> <pattern id="check" data-name="check" width="1" height="1"> <rect class="cls-903" width="${s}" height="${s}" /> <rect class="cls-904" width="${s}" height="${s}" /> <path class="cls-905" transform="translate(0 0)" d="M14.3536 4.35359L6.00004 12.7071L1.64648 8.35359L2.35359 7.64648L6.00004 11.2929L13.6465 3.64648L14.3536 4.35359Z" /> </pattern>`;
defsPattern.insertAdjacentHTML('beforeend', pattern); // стили для сектора


function getNumberAllRows () { // отдает кол-во рядов + кол-вл отступов
    return document.querySelectorAll('input#point').length;
};

function getNumberOnlyRows () { // отдает кол-во рядов
    return document.querySelectorAll('input.point').length;
};


function createMargin () { // добавляется отступ
    let form = document.createElement('div');
    form.classList = 'form';

    let input = document.createElement('input');
    input.type = 'button';
    input.disabled = 'disabled';
    input.value = 'Отступ';
    input.id = 'point';

    document.body.append(form);
    form.append(input);

    checkHeight();
    addField();

    arrHistory[getNumberAllRows()-1] = '—';
};


function createRows () { // функция создает ряды
    let allRows = getNumberAllRows();
    let row = getNumberOnlyRows();

    let form = document.createElement('div');
    form.classList = 'form';

    let input = document.createElement('input');
    input.classList = 'add' + row;
    input.id = 'add';
    input.oninput = function() {
        this.value = this.value.replace(/[^0-9\.\+\-\ ]/g, '');
    };

    let button = document.createElement('input');
    button.id = 'point';
    button.value = '+';
    button.classList = 'point';
    button.type = 'button';
    button.onclick = function () {
        createPoints(document.querySelector('input.add' + row).value, row, allRows);
    };

    

    document.body.append(form);
    form.append(input, button);

    let searchFirstRow = SVG.find('#nameSector').first();
    let addRowGroup = sector.group();
    searchFirstRow.before(addRowGroup);
    
    SVG.find('g#numbers').group(); // группа для нумерации
    
    
};

function checkHeight () { // функция проверяет высоту контейнера
    viewbox.height((getNumberAllRows()+1)*(s+m)+s+m)
};

function addField () { // добавление поля
    let addField = SVG.find('g#field'); 
    addField.clear();
    addField.polyline(`0, 0 50, 20 100, 0`).attr({stroke: '#b8b8b8', fill: 'none'}).cx(Math.max.apply(null, arrWidth)/2).y(getNumberAllRows()*(s+m)+s);
};


function fieldUp () { // поднимает поле по нажатию на кнопку
    console.log(SVG.find('g#field').y());

    let cY = SVG.find('g#field').y();

    let addField = SVG.find('g#field'); 
    addField.clear();

    addField.polyline(`0, 0 50, 20 100, 0`).attr({stroke: '#b8b8b8', fill: 'none'}).cx(Math.max.apply(null, arrWidth)/2).y(cY[0]-s-m);


    viewbox.height(viewbox.height()-s-m);



};


function createNewSector () { // очищается вьюпорт и история для создания нового сектора
    let create = confirm('Создать новый сектор?');
    if (create == true) {
        sector.clear();
        sector.group().id('numbers');
        sector.group().id('field');
        document.querySelectorAll('input.point').forEach(e => e.remove());
        document.querySelectorAll('input#add').forEach(e => e.remove());
        document.querySelectorAll('input#point').forEach(e => e.remove());
        arrWidth = [105];
        arrHistory = [];
    };
};


function addNumbers () { // добавление нуммерация
    for (let i = 0; i < getNumberOnlyRows(); i++) { 

        let row = getNumberOnlyRows();
        let search = SVG.find('#nameSector').get(row-(i+1));
        
        let y = search.find('rect').y()[0].at(-1);
        let leftX = search.find('rect').x()[0].at(0-direction);
        let rightX = search.find('rect').x()[0].at(-1+direction);


        if (leftX == undefined) { // если создается пустой ряд, нуммерация к этому ряду не добавляется, но учитывает его в общем количестве
            console.log('Создан пустой ряд без нуммерации');
        } else {
            let numbers = SVG.find('g#numbers').get(i);
            numbers.clear();
            numbers.plain(row-(i+1)+1).cy(0.4*s+y).cx(leftX-(0.5*s+m)).addClass('cls-3');
            numbers.plain(row-(i+1)+1).cy(0.4*s+y).cx(rightX+1.5*s+m).addClass('cls-3');
        };
    };


    let search = SVG.find('g#numbers').children().children().x()[0][0];
    
};



function createPoints(data, y, w) {

    if (data == '—') {
        console.log('Отступ в ряду '+y);
        // document.querySelector('add'+y).disabled = 'disabled';
    }


    if (data.length == 0) {
        data = '0';
    };


    

    let search = SVG.find('#nameSector').get(getNumberOnlyRows()-(y+1));
    search.clear(); // очищает ряд

    let dataResult = data.match(/\S+/g); // массив, в котором дата разбита на части

    function originX () { // функция ищет последний по счету прямоугольник в ряду
        let origin = search.find('rect').x()[0].at(-1);

        if (direction == 0) {
            origin = search.find('rect').x()[0].at(-1);
        } else {
            origin = search.find('rect').attr('x')[0].at(0);
        }

        if (origin == undefined) {
            origin = m;
        };
        return origin;
    };


    let onlyPoints = data.match(/\b(?<!\+)(?<!\.)\d+/g);
    function sum (n) { // функция считаемт сумму всех физических мест
        let sum = 0;
        for (let i = 0; i < n.length; i++){
            let number = parseInt(n[i].replace(/[^0-9]/g, ''));
            sum += number;
        }
        return sum;
    };


    for (let i = 0; i < dataResult.length; i++) { // цикл читает вводиму дату, разбивает на данные
        point = 0;
        skip = 0;
        
        if (dataResult[i].match(/(?<=\+)\S+/)) { 
            x = originX();
            let ind = dataResult[i].match(/(?<=\+)\S+/); // маска поиска отступов, оставляет только цифру без символов
            
            if (direction == 0) {
                search.rect().id('temp').x((s+m)*ind+x); // рисует временные прямоугольники для отступов
            } else {
                search.rect().id('temp').x((s+m)*ind+x).back();
            }

        } else if (dataResult[i].match(/(?<=\-)\d+/)) {
            skip = dataResult[i].match(/(?<=\-)\d+/); // маска поиска пропусков, оставляет только цифру без символов
        } else {
            point = dataResult[i];  
        };

        addPoint (point, skip); // передает разбитую дату в отрисовщик
    };


    function addPoint (point, skip) { // отрисовщик

        for (let i = 0; i < skip; i++) { // пропуски
            
            if (direction == 0) {
                let skip = search.group();
            } else {
                let skip = search.group().back();
            }
        };

        for (let i = 0; i < point; i++) { // места + отступы
            let number = search.find('g')[0].length;
            x = originX();
            
            if (direction == 0) {
                let seat = search.group();
                seat.rect(s, s).addClass('cls-1').attr({ x: x+m+s, y: ((s+m)*w)+m, rx: 1});
                seat.plain(number+1).addClass('cls-2').cx(seat.get(0).cx()[0]).cy(seat.get(0).cy()[0]);
            } else {
                let seat = search.group().back();
                seat.rect(s, s).addClass('cls-1').attr({ x: x+m+s, y: ((s+m)*w)+m, rx: 1});
                seat.plain(sum(onlyPoints)-number).addClass('cls-2').cx(seat.get(0).cx()[0]).cy(seat.get(0).cy()[0]);
            }
        };
    };

    
    
    arrWidth[y+1] = originX()+2*s+2*m; // добавляет в массив с шириной новое значение
    viewbox.width(Math.max.apply(null, arrWidth)); // увеличивает ширину вьюпорта
    sector.find('rect#temp').remove(); // удаляет временные прямоугольники
    addNumbers();
    addField();
    arrHistory[w] = data;
    checkHeight();
};



function deleteLastRows () { // удаление последнего ряда

    let searchRow = document.querySelectorAll('input#point');

    if (searchRow[searchRow.length - 1].classList[0] == 'point') {
        SVG.find('#nameSector').first().remove();
        let button = document.querySelectorAll('input.point');
        let input = document.querySelectorAll('input#add');
        button[button.length-1].remove(); // удаляет кнопку
        input[input.length-1].remove(); // удаляет поле ввода значения
    } else {
        searchRow[searchRow.length - 1].remove();
    };

    checkHeight();


    if (searchRow[searchRow.length - 1].classList[0] == 'point') {
        arrWidth.pop(); // удаляет последнее значение из массива с шириной вьюпорта
    };
    viewbox.width(Math.max.apply(null, arrWidth)); // уменьшает ширину вьюпорта


    let numbers = SVG.find('g#numbers').children()[0];
    if (searchRow[searchRow.length - 1].classList[0] == 'point') {
        numbers[numbers.length - 1].remove();
    };

    addNumbers();
    addField();
    arrHistory.pop();
};





function saveSvg() {
    let vbWidth = SVG.find('svg').attr('width')
    let vbHeight = SVG.find('svg').attr('height')
    viewbox.viewbox(0, 0, vbWidth[0], vbHeight[0]);

    let confirm = prompt('Введите название сектора', );

    if (confirm !== null) {
        SVG.find('#nameSector').id(`${confirm}`);

        let link = document.createElement('a');
        link.download = confirm + '.svg';

        let scheme = viewbox.svg();
        let blob = new Blob([scheme], {type:'image/svg+xml;charset=utf-8'});
        link.href = URL.createObjectURL(blob);

        link.click();

        URL.revokeObjectURL(link.href); 
    };

    if (confirm !== null) {
        let link = document.createElement('a');
        link.download = confirm + '.txt';

        let blob = new Blob([arrHistory], {type:'text/plain'});
        link.href = URL.createObjectURL(blob);

        link.click();

        URL.revokeObjectURL(link.href);
    };

    SVG.find('g#Layer_2').children()[0].id('nameSector');
    viewbox.attr('viewBox', null);

};


window.addEventListener('beforeunload', (event) => { // закрывает окно с подтверждением
    event.preventDefault();
    event.returnValue = '';
});










function importData () {

    createNewSector();
    let data = prompt('Введите значение', );
    let dataIn = data.split(',');
   
        for (let i = 0; i < dataIn.length; i++) {
                document.querySelector('.addRowButton').click();
                let input = document.querySelector('.add'+i).value=dataIn[i];
        };

    applyAll();
};




function applyAll () { // применяет все значение, введеные в инпутах
    let rows = document.querySelectorAll('.point');
    rows.forEach(element => element.click());
}



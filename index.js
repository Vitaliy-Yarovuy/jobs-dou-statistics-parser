const parse5 = require('parse5');
const fs = require('fs');
const {conditionBuilder, search, getAttr, getText, hasClass} = require('./utils.js');
const identity = x => x;


let text, doc, items;
//index
text = fs.readFileSync('./requests-data/index.html', {encoding: 'UTF8'});
doc = parse5.parse(text);


// category 'select[name="category"] > option'
const selectCondition = conditionBuilder('select', [{name: 'name', value: 'category'}]);
items = search(doc, conditionBuilder('option', [],
	node => node.parentNode && selectCondition(node.parentNode))
);

const categories = items
	.map(item => getAttr(item, 'value').value)
	.filter(identity);


console.log('categories', categories);

//companies
text = fs.readFileSync('./requests-data/companies.html', {encoding: 'UTF8'});
doc = parse5.parse(text);

// category 'div.h2 > a.cn-a'
const parentCondition = conditionBuilder('div', [{name: 'class', value: 'h2'}]);
items = search(doc, conditionBuilder('a', [{name: 'class', value: 'cn-a'}],
	(node) => node.parentNode && parentCondition(node.parentNode))
);

const companies = items.map(item => {
	const key = getAttr(item, 'href').value.split('/').splice(-2).shift(),
		name = item.childNodes[0].value;
	return {key, name};
});

console.log(companies);

//vacancies_category_Front_End
text = fs.readFileSync('./requests-data/vacancies_category_Front_End.html', {encoding: 'UTF8'});
doc = parse5.parse(text);


// vacancies 'li.l-vacancy'
items = search(doc, conditionBuilder('li', [{name: 'class', value: 'l-vacancy'}]));

vacancies = items.map(item => {
	const link = search(item, conditionBuilder('a', [{name: 'class', value: 'vt'}]))[0],
		isHot = hasClass(item, '__hot'),
		href = getAttr(link, 'href').value,
		[company, ,id,] = href.split('/').splice(-4),
		title = link.childNodes[0].value,
		descTag = search(item, conditionBuilder('div', [{name: 'class', value: 'sh-info'}]))[0],
		desc = parse5.serialize(descTag).replace(/\s+/gi,' ').trim();

		return{
			id,
			company,
			title,
			href,
			isHot,
			desc,
			date: new Date
		}

});


console.log(vacancies);


// vacancies rss


text = fs.readFileSync('./requests-data/vacancies_feeds_search.rss', {encoding: 'UTF8'});

text = text
	.replace(/\<link\>/gi,'<rlink>')
	.replace(/\<\/link\>/gi,'</rlink>');
doc = parse5.parseFragment(text);


items = search(doc, conditionBuilder('item'));

vacancies = items.map(item => {

	const title = getText(search(item, conditionBuilder('title'))[0]),
		href = getText(search(item, conditionBuilder('rlink'))[0]) || '',
		date = new Date(getText(search(item, conditionBuilder('pubDate'))[0])),
		desc = parse5.serialize(search(item, conditionBuilder('description'))[0]).replace(/\s+/gi,' ').trim(),
		[company, ,id,] = href.split('/').splice(-4),
		isHot = false;

	return{
		id,
		company,
		title,
		href,
		isHot,
		desc,
		date
	}

});


console.log(vacancies);
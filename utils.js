const getAttr = ({attrs}, key) => attrs
	.filter(({name}) => name === key)[0];

const hasClass = ({attrs}, className) => attrs
	.filter(({name}) => name === 'class')
	.some(({value}) => value.indexOf(className) !== -1);

const getText = ({childNodes:[child]=[]}={}) => child && child.value;


const EMPTYATTR = {name: '', value: ''};

const conditionBuilder = (searchTag, searchAttrs = [], condition = () => true) =>
	(node) =>
		node.tagName === searchTag &&
		searchAttrs.every(
			({name, value}) => ( getAttr(node, name) || EMPTYATTR ).value.indexOf(value) !== -1
		) &&
		condition(node);


const search = (node, condition) =>
	condition(node) ? [node] :
		!node.childNodes ? [] :
			[].concat(
				...node.childNodes.map(
					child => search(child, condition)
				)
			);

module.exports = {
	getAttr,
	getText,
	hasClass,
	search,
	conditionBuilder
};
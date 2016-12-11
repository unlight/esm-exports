import * as ts from "typescript";

export function parseKeyword(statement: any | ts.Statement) {
    // console.log('parseKeyword', statement);
	const names = [];
	const declarationList = statement.declarationList;
	if (declarationList) {
		declarationList.declarations.forEach(d => names.push(d.name.text));
	} else if (statement.name) {
		names.push(statement.name.text);
	}
	return names;
}
import * as ts from "typescript";

export function parseDeclaration(statement: any | ts.Statement) {
    // console.log('parseDeclaration', statement);
    const names = [];
    const exportAll = !(statement.exportClause && statement.exportClause.elements);
    if (exportAll) {
        names.push(null);
    } else if (statement.exportClause) {
        statement.exportClause.elements.forEach(e => names.push(e.name.text));
    }
    return names;
}
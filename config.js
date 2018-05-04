/*
 GCloud Configuration variables 
 For some reason it felt like it made sense to put these in a different file, as if it were coming in from an API or something.
 */
exports.projectId = "propark-code-challenge";
exports.PORT = 8080;
exports.datasetName = "laguardia";
exports.tableName = "parking_availability";
exports.schema =
	"id:integer,terminalA:float,terminalB:float,terminalCD:float,timestamp:timestamp";
exports.site = "https://laguardiaairport.com/";

var fs = require('fs'),
	program = require('commander'),
	OFX = require('./ofx'),
	transactions = [],
	rows,
	dolar = 1,
	totalFatura = 0;

program.version('0.0.1')
	.option('-f, --file [file]', 'Input file')
	.option('-d, --dolar [file]', 'Input file')
	.parse(process.argv);

fileData = fs.readFileSync(program.file);
rows = fileData.toString().split('\r\n');

rows.forEach(function(row, index) {
	if(/PGTO\.\sCASH\sAG\./.test(row) || /PGTO\.\sCOBRANCA/.test(row)) {
		return;
	}

	if(/\d\d\/\d\d\/\d\d\s/.test(row)) {
		obj = {};

		obj.date        = row.slice(0 , 8 ).trim();
		obj.dateObj     = new Date('20' + obj.date.split('/').reverse().join('-') + ' GMT-0300');
		obj.timestamp   = '20' + obj.date.split('/').reverse().join('') + '120000[-3:BRT]';
		obj.description = row.slice(9 , 50).trim().replace(/\s\s+/g, ' ');
		obj.brlValue    = row.slice(50, 68).trim().replace(/\./g, '').replace(',', '.');
		obj.usdValue    = row.slice(68, 80).trim().replace(/\./g, '').replace(',', '.');

		obj.brlValue = parseFloat(obj.brlValue);
		obj.usdValue = parseFloat(obj.usdValue);

		transactions.push(obj);
	}

	if(/RESUMO EM D/.test(row)) {
		var dolarStr = rows[index+5].substr(54, 10).replace(',', '.')
		if(/\d\.\d\d\d\d/.test(dolarStr)) {
			dolar = parseFloat(dolarStr);
		}
	}
});

var maxDate = transactions.reduce(function(a, b) {
	return a.dateObj > b.dateObj ? a : b
});

var minDate = transactions.reduce(function(a, b) {
	return a.dateObj < b.dateObj ? a : b
});


function processData() {
	transactions.forEach(function(transaction) {
		if (transaction.brlValue == 0 && transaction.usdValue != 0) {
			transaction.brlValue = transaction.usdValue * dolar;
		}
		totalFatura += transaction.brlValue;
	})
	console.log('DÓLAR:', dolar);
	console.log('TOTAL FATURA:', totalFatura);

	var data = {
		minDate: minDate,
		maxDate: maxDate,
		transactions: transactions,
		totalFatura: totalFatura
	}

	var ofx = OFX.generate(data);

	fs.writeFileSync(program.file.replace('txt', 'ofx'), ofx);
}

if(dolar) {
	processData();
} else {
	var prompt = require('prompt');
	var schema = {
		properties: {
			dolar: {
				pattern: /^\d+\.?\d*$/,
				message: 'Name must be only letters, spaces, or dashes',
				required: true
			}
		}
	};

	prompt.start();

	prompt.get(schema, function (err, result) {
		dolar = result.dolar;
		processData();
	});
}
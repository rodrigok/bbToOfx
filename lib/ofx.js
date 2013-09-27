
exports.generate = function(data) {
	var ofx  = '';

	ofx  = '<OFX>\n';
	ofx += '	<SIGNONMSGSRSV1>\n';
	ofx += '		<SONRS>\n';
	ofx += '			<STATUS>\n';
	ofx += '				<SEVERITY>INFO</SEVERITY>\n';
	ofx += '			</STATUS>\n';
	ofx += '			<DTSERVER>'+(new Date).toISOString().split('T')[0].replace(/-/g, '')+'120000[-3:BRT]</DTSERVER>\n';
	ofx += '		</SONRS>\n';
	ofx += '	</SIGNONMSGSRSV1>\n';
	ofx += '	<BANKMSGSRSV1>\n';
	ofx += '		<STMTTRNRS>\n';
	ofx += '			<STATUS>\n';
	ofx += '				<SEVERITY>INFO</SEVERITY>\n';
	ofx += '			</STATUS>\n';
	ofx += '			<STMTRS>\n';
	ofx += '				<CURDEF>BRL</CURDEF>\n';
	ofx += '				<BANKACCTFROM>\n';
	ofx += '					<BANKID>1</BANKID>\n';
	ofx += '					<ACCTTYPE>CHECKING</ACCTTYPE>\n';
	ofx += '				</BANKACCTFROM>\n';
	ofx += '				<BANKTRANLIST>\n';
	ofx += '					<DTSTART>' + data.minDate.timestamp + '</DTSTART>\n';
	ofx += '					<DTEND>' + data.maxDate.timestamp + '</DTEND>\n';

	data.transactions.forEach(function(transaction) {
		ofx += '					<STMTTRN>\n';
		ofx += '						<TRNTYPE>OTHER</TRNTYPE>\n';
		ofx += '						<DTPOSTED>'+transaction.timestamp+'</DTPOSTED>\n';
		ofx += '						<TRNAMT>'+(-transaction.brlValue)+'</TRNAMT>\n';
		ofx += '						<MEMO>'+transaction.description+'</MEMO>\n';
		ofx += '					</STMTTRN>\n';
	})

	ofx += '				</BANKTRANLIST>\n';
	ofx += '				<LEDGERBAL>\n';
	ofx += '					<BALAMT>'+data.totalFatura.toFixed(2)+'</BALAMT>\n';
	ofx += '					<DTASOF>'+data.maxDate.timestamp+'</DTASOF>\n';
	ofx += '				</LEDGERBAL>\n';
	ofx += '			</STMTRS>\n';
	ofx += '		</STMTTRNRS>\n';
	ofx += '	</BANKMSGSRSV1>\n';
	ofx += '</OFX>\n';

	return ofx;
}
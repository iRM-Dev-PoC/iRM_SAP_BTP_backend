run:
	npm run start:dev

exposedb:
	cf ssh -L localhost:5433:postgres-cfede104-831e-4cb0-b136-71f53273fec1.cqryblsdrbcs.us-east-1.rds.amazonaws.com:1943 demoproj -N	

cflogin:
	cf login -a https://api.cf.us10-001.hana.ondemand.com -u rite2rijudas@gmail.com -p Rd@9800495203 
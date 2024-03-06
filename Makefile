run:
	npm run start:dev
	cf ssh -L localhost:5433:postgres-cfede104-831e-4cb0-b136-71f53273fec1.cqryblsdrbcs.us-east-1.rds.amazonaws.com:1943 demoproj -N

connectpgadmin:
	cf ssh -L localhost:5433:postgres-cfede104-831e-4cb0-b136-71f53273fec1.cqryblsdrbcs.us-east-1.rds.amazonaws.com:1943 demoproj -N	
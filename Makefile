MAKEFLAGS += --silent --keep-going


########################################################################################
####                                 NPM SCRIPTS                                    ####
########################################################################################
.PHONY: dev-frontend dev-models dev-db dev-backend-dawid

dev-frontend:
	@cd frontend && pnpm run dev:frontend

dev-models:
	@cd frontend && pnpm run dev:server:models

dev-backend-dawid:
	@cd ./backend/dawid && pipenv run fastapi dev server.py --port 8888



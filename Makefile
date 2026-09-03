.PHONY: install test build run docker-build docker-up

install:
	@echo "No dependencies to install for this HTML/CSS/JavaScript project"

test:
	python -m unittest discover -s tests -v

build:
	@echo "No build step required for this project"

run:
	@echo "Open landing.html in your browser"

# Needed from M4 onwards
docker-build:
	docker build -t study-planner .

docker-up:
	docker compose up --build
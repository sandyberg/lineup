APP_NAME = lineup
ZIP_FILE = out/$(APP_NAME).zip

ROKU_IP ?= YOUR_ROKU_IP
ROKU_USER ?= rokudev
ROKU_PASS ?= YOUR_PASSWORD

.PHONY: build deploy clean package

build:
	@mkdir -p out
	@rm -f $(ZIP_FILE)
	@cd . && zip -r $(ZIP_FILE) manifest source components images \
		-x "*.DS_Store" -x "__MACOSX/*"
	@echo "Built $(ZIP_FILE)"

deploy: build
	@echo "Deploying to Roku at $(ROKU_IP)..."
	@curl --user $(ROKU_USER):$(ROKU_PASS) --anyauth \
		-F "mysubmit=Install" \
		-F "archive=@$(ZIP_FILE)" \
		http://$(ROKU_IP)/plugin_install
	@echo "\nDeployed!"

# Store: upload signed .pkg from /plugin_package, not raw zip. See README (genkey password vs ROKU_PASS).
package:
	@echo "After 'make deploy': open http://$(ROKU_IP)/plugin_package"
	@echo "If 'Invalid Password': the Packager password is from 'telnet ROKU_IP 8080' then genkey, NOT the rokudev/curl dev password."
	@echo "Fill App name/version (e.g. Lineup 1.0.1), download .pkg, upload to developer.roku.com."

clean:
	@rm -rf out
	@echo "Cleaned"

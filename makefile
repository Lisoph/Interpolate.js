SRC_FILES_DIR := ./src/
SRC_FILE_NAMES := interpolate.js getcss.js methods.js animcontroller.js strutils.js color_property_controller.js
OUTPUT := ./build/interpolate.js
UGLIFY_OUTPUT := false

UGLIFYJS := uglifyjs

SRC_FILES := $(addprefix $(SRC_FILES_DIR), $(SRC_FILE_NAMES))

all: build

build: $(OUTPUT)

$(OUTPUT):
ifeq ($(UGLIFY_OUTPUT), false)
	$(UGLIFYJS) $(SRC_FILES) --beautify -o $(OUTPUT)
else
	$(UGLIFYJS) $(SRC_FILES) -o $(OUTPUT)
endif

clean:
	rm -f $(OUTPUT)


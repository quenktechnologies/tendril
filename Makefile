.DELETE_ON_ERROR:

# Copy all the sources to the lib folder then run tsc.
lib: $(shell find src -type f)
	rm -R $@ || true
	./node_modules/.bin/tsc --project .

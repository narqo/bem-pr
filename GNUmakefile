NPM := npm

TESTS := $(PWD)/test
FIXTURES := $(TESTS)/fixtures

clean:
	rm -rf $(TESTS)/bem-core

test: $(TESTS)/bem-core $(TESTS)/bem-core/node_modules
	$(<)/node_modules/.bin/bem make -r $(<) sets

$(TESTS)/bem-core: $(FIXTURES)/bem-core $(FIXTURES)/bem-core/.bem
	cp -fR $(<) $(@)
	cp -fR $(FIXTURES)/fake-dotbem/* $(@)/.bem

$(TESTS)/bem-core/node_modules: $(TESTS)/bem-core
	-cd $(<) && $(NPM) install

$(FIXTURES)/bem-core: $(FIXTURES)/bem-core/.bem

$(FIXTURES)/bem-core/.bem:
	git submodule update --init -f -- $(dirname $(@))

.PHONY: test clean


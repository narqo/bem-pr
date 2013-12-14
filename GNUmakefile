TESTS := $(PWD)/test
FIXTURES := $(TESTS)/fixtures

clean:
	$(RM) -rf $(TESTS)/bem-core

test: $(TESTS)/bem-core $(TESTS)/bem-core/node_modules
	$(<)/node_modules/.bin/bem make -r $(<) sets

$(TESTS)/bem-core: $(FIXTURES)/bem-core $(FIXTURES)/bem-core/.bem
	cp -fR $(<) $(@)
	cp -fR $(FIXTURES)/fake-dotbem/* $(@)/.bem

$(TESTS)/bem-core/node_modules: $(TESTS)/bem-core
	-cd $(<) && npm install

$(FIXTURES)/bem-core: $(FIXTURES)/bem-core/.bem

$(FIXTURES)/bem-core/.bem:
	git submodule update --init -f -- $(dirname $(@))

.PHONY: test clean


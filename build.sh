mkdir -p temp-bundle
cp -R out/extension temp-bundle/extension/
cp ./extension-package.json temp-bundle/extension/package.json
cd temp-bundle
zip -r ../vschat-local.vsix .
cd ..
rm -rf temp-bundle
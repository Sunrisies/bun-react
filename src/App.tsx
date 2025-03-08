import { useState } from 'react';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
// import { Button, Card, Input } from 'shadcn-ui';

function JSONToTypeScriptConverter() {
  const [inputJson, setInputJson] = useState('');
  const [outputTypescript, setOutputTypescript] = useState('');

  const jsonToTypeScriptType = (jsonString: string, typeName = 'RootObject') => {
    let jsonObject;
    try {
      jsonObject = JSON.parse(jsonString);
    } catch (_) {
      throw new Error(`JSON字符串无效`);
    }

    const { typeDefinition, nestedTypes } = generateTypeDefinition(jsonObject, typeName);

    return `${nestedTypes}\n\n${typeDefinition}`;
  };

  const generateTypeDefinition = (obj, typeName) => {
    const typeProperties = [];
    const nestedTypes = [];

    for (const [key, value] of Object.entries(obj)) {
      const type = getType(value, key, nestedTypes);
      typeProperties.push(`${key}: ${type};`);
    }

    const typeDefinition = `export interface ${typeName} {\n  ${typeProperties.join('\n  ')}\n}`;
    const nestedTypesDefinitions = nestedTypes.join('\n\n');
    // console.log(typeDefinition, nestedTypesDefinitions, '---------');
    return { typeDefinition, nestedTypes: nestedTypesDefinitions };
  };

  const getType = (value, key, nestedTypes) => {
    if (value === null) {
      return 'null';
    }

    const type = typeof value;
    if (type === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return 'any[]';
        }
        const itemType = getType(value[0], key, nestedTypes);
        return `${itemType}[]`;
      } else {
        const nestedTypeName = `I${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        const { typeDefinition } = generateTypeDefinition(value, nestedTypeName);
        nestedTypes.push(typeDefinition);
        console.log(value, key);
        getType(value, key, nestedTypes)
        return nestedTypeName;

      }
    }
    // console.log(value, key, nestedTypes);

    switch (type) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'any';
    }
  };

  const handleConvert = () => {
    try {
      const output = jsonToTypeScriptType(inputJson);
      setOutputTypescript(output);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleClear = () => {
    setInputJson('');
    setOutputTypescript('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">JSON to TypeScript </h1>
      <div className="w-full flex-1 flex justify-center items-center border border-gray-300 rounded-md p-4 gap-3">
        <Card className="mb-4 shadow-lg flex-1 h-full">
          <CardHeader>
            <CardTitle>输入 JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              className="w-full h-[74vh] p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
            />
          </CardContent>
        </Card>
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            <Button onClick={handleConvert} variant="default" className="mr-2">
              转换
            </Button>
            <Button onClick={handleClear} variant="default">
              清除
            </Button>
          </div>
        </div>
        <Card className="flex-1 h-full">
          <CardHeader className='flex !flex-row justify-between items-center'>
            <CardTitle>
              输出 TypeScript
            </CardTitle>
            <Button variant="default" id="copyButton" className="copy-btn">
              复制
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={outputTypescript}
              onChange={(e) => setInputJson(e.target.value)}
              className="w-full h-[74vh] p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default JSONToTypeScriptConverter;


import textInputComponent from './forms/textInput';
import maybeInputComponent from './forms/maybeInput';
import checkboxInputComponent from './forms/checkboxInput';
import selectInputComponent from './forms/selectInput';
import arrayInputSrc from './forms/arrayInput';

export function formFactory(){
	let validationHash = [];
	return {
		register(fn){
			validationHash.push(fn);
		},
		isValid() {
			return validationHash.every(fn => fn.call());
		},
		showValidation: m.prop(false)
	};
}

export let textInput = args => m.component(textInputComponent, args);
export let maybeInput = args => m.component(maybeInputComponent, args);
export let checkboxInput = args => m.component(checkboxInputComponent, args);
export let selectInput = args => m.component(selectInputComponent, args);
export let arrayInput = arrayInputSrc;
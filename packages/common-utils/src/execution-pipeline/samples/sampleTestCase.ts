import {
  CommonExecutionHandler,
  findContextParam,
  findContextParams,
  pushParams,
  pushResults,
} from '../pipelines';
import {
  KeywordParamsType,
  KeywordResultTypes,
  NewWebEngine,
} from './NewWebEngine';

const engine = new NewWebEngine({});

/// --- Begin demo "Using External Element Finder"
const smartDriver = {} as any;

const smartElementFinder: CommonExecutionHandler = async ({ context }) => {
  const testObject = findContextParam(
    context,
    KeywordParamsType.TEST_OBJECT
  )?.value;
  const element = await smartDriver.findElement(testObject);
  if (element) {
    pushResults(context, {
      type: KeywordResultTypes.ELEMENT,
      value: element,
    });
  } else {
    throw new Error('No element can be found by using Smart Element Finder');
  }
};

engine.pipeline.registerPreHandler(smartElementFinder);
// --- End demo "Using External Element Finder"

//-----------------------------------------------------

/// --- Begin demo "Injecting Crypto Service"
// We will place the below code into the sideload
const cryptoHandler: CommonExecutionHandler = async ({ context }) => {
  const cryptoService = {} as any;
  await Promise.all(
    findContextParams(context, KeywordParamsType.ENCRYPTED_TEXT).map(
      async (paramI) => {
        const plainText = await cryptoService.decrypt(paramI.value);
        pushParams(context, {
          type: KeywordParamsType.TEXT,
          value: plainText,
        });
      }
    )
  );
};
engine.pipeline.registerBeforePreHandler(cryptoHandler);
// --- End demo "Injecting Crypto Service"

//-----------------------------------------------------

/// --- Usage

// Click with smart element finder support
engine.click({
  name: 'Login Button',
  image: '...',
});

// Set encrypted text with the injected crypto service
engine.setEncryptedText('css=#password', 'bmFuZyBhbSB4YSBkYW4=');

import TextArea from "./TextArea";
import TextInput from "./TextInput";
import SelectInput from "./SelectInput";

export default function ProfileForm() {
  return (
    <section className="flex flex-wrap flex-col w-10/12 mx-auto sm:mt-52 sm:pb-32 font-montserrat">
      <SelectInput>Pronoun</SelectInput>
      <TextInput>Display name</TextInput>
      <TextInput>Profile image</TextInput>
      <TextArea>About me</TextArea>
      <TextInput>X</TextInput>
      <TextInput>Facebook</TextInput>
      <TextInput>Instagram</TextInput>
      <TextInput>Telegram</TextInput>
      <TextInput>Github</TextInput>
      <TextInput>IRC</TextInput>
      <TextInput>Wikimedia alternative account</TextInput>
      <TextInput>Wikimedia developer account</TextInput>
      <SelectInput>Preferred contact method</SelectInput>
      <SelectInput>Region</SelectInput>
    </section>
  )
}
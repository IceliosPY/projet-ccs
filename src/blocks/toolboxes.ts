export const TOOLBOX_BEGINNER = `
<xml>
  <category name="Logique" colour="#5C81A6">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_boolean"></block>
  </category>

  <category name="Boucles" colour="#5CA65C">
    <block type="controls_repeat_ext">
      <value name="TIMES">
        <shadow type="math_number">
          <field name="NUM">5</field>
        </shadow>
      </value>
    </block>
  </category>

  <category name="Maths" colour="#5C68A6">
    <block type="math_number"></block>
    <block type="math_arithmetic"></block>
  </category>

  <category name="Texte" colour="#5CA68D">
    <block type="text"></block>
    <block type="text_join"></block>
    <block type="text_print"></block>
  </category>

  <category name="Variables" colour="#A65C81" custom="VARIABLE"></category>
  <category name="Fonctions" colour="#9A5CA6" custom="PROCEDURE"></category>
</xml>
`;

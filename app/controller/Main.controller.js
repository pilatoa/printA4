sap.ui.define([
   'jquery.sap.global',
   'sap/ui/model/json/JSONModel',
   'sap/m/MessageBox',
   'sap/m/MessageToast',
   './BaseController',
   '../model/CommonManager'
], function(jQuery,  JSONModel, MessageBox, MessageToast, BaseController, CommonCallManager) {
   "use strict";

   var MainController = BaseController.extend("printa4.controller.Main", {
      modelInfo: new JSONModel(),
      modelOrders: new JSONModel(),
      generalInfo: {},
      onInit: function() {
         this.modelInfo.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
         this.getView().setModel(this.getInfoModel(), "info");
      },
      onAfterRendering: function() {

      },
      onBeforeRendering: function() {

      },
      getLinesInfo: function() {
         var that = this;

         if (!this._busyDialog) {
            this._busyDialog = sap.ui.xmlfragment("printa4.view.BusyDialog", this);
            this.getView().addDependent(this._busyDialog);
         }

         jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
         this._busyDialog.open();

         var transaction = "ES/TRANSACTIONS/SWIMLANE/printa4/Z_GET_LINE_SETTINGS_v2";

         function success(data) {
            if (data.Rows) {
               that.generalInfo = data.Rows[0];
               that.modelInfo.setData(data.Rows[0]);
            } else {}
            that._busyDialog.close();

         }

         function failure(err) {
            that._busyDialog.close();
            MessageToast.show("Errore JS funzione getLinesInfo");
         }

         var callData = {
            LINENAME: this.line
         };

         CommonCallManager.getRows(transaction, callData, success, failure);
      },
      onPressRilascia: function(oEvent) {
         var currObj = oEvent.getSource().getBindingContext('modelOrders').getObject();
         var that = this;

         jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
         this._busyDialog.open();

         var params = {
            LINENAME: this.line,
            SHOP_ORDER: currObj.SHOP_ORDER,
            USER_ID: this.idUser,
            "TRANSACTION": "ES/TRANSACTIONS/SWIMLANE/Z_RELEASE_ORDER",
            "OutputParameter": "*"
         };

         $.ajax({
            type: 'GET',
            async: true,
            data: params,
            url: "/XMII/Runner",
            dataType: 'xml',
            success: function(result) {

               try {
                  that._busyDialog.close();
                  if (jQuery(result).find("RC").text() === "0") {
                     MessageToast.show("Ordine rilasciato");
                  } else {
                     MessageBox.show(jQuery(result).find("MESSAGE").text());
                  }
                  that.getOrders();
               } catch (err) {
                  that.getOrders();
               }
            },
            error: function(error) {
               that._busyDialog.close();
               that.getOrders();
            }
         });
      },
getListaCicli: function() {
          var params = {
             "TRANSACTION": "ES/TRANSACTIONS/SWIMLANE/CUCINA/Z_GET_CICLO_LIST",
             "OutputParameter": "JSON"
          };

          $.ajax({
             type: 'GET',
             async: false,
             data: params,
             url: "/XMII/Runner",
             dataType: 'xml',
             success: function(result) {

                try {
                  var jsonStr = jQuery(result).text();
                 var jsonObj = JSON.parse(jsonStr);

                  //  that.modelClassificazioni.setData(jsonObj);

                } catch (err) {

                }
             },
             error: function(error) {

             }
          });
        },

      getProvaJSON: function() {
         var that = this;

         if (!this._busyDialog) {
            this._busyDialog = sap.ui.xmlfragment("printa4.view.BusyDialog", this);
            this.getView().addDependent(this._busyDialog);
         }

         jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
         this._busyDialog.open();

         var transaction = "ES/TRANSACTIONS/ZZ_POLSIM/OUTPUT_JSON";

         function success(data) {
            if (data) {
               var pippo = 4343;
            } else {
               var pippo = 54343;
            }
            that._busyDialog.close();

         }

         function failure(err) {
            that._busyDialog.close();
            MessageToast.show("Errore JS funzione getMainModel");
         }

         var callData = {
            Mock: 'jsonLocalMode'
         };

         CommonCallManager.getRows(transaction, callData, success, failure);
      }
   });

   return MainController;
});

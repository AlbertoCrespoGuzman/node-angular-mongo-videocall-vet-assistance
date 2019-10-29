'use strict';
angular.module('confusionApp')

.controller('PetsController', ['$rootScope', '$stateParams','$timeout','$window','$scope', 'ngDialog',
	'UserDetailsFactory','AuthFactory',
		function ($rootScope, $stateParams,$timeout, $window, $scope, ngDialog, UserDetailsFactory, AuthFactory) {
        $rootScope.profileActive = 'pets'

        UserDetailsFactory.query({userId : AuthFactory.getIduser()})
	            .$promise.then(
	                function (response) {
	                	console.log(response)
	                	$rootScope.pets = response.pets
	                },
	                function (err) {
	                    console.log(err)
	                })


        $scope.openDialogPet = function (id) {
        	$rootScope.pet_id_for_dialog = id
        	$rootScope.petDialog = ngDialog.open({ 
                                                            template: 'views/DialogPet.html', 
                                                            scope: $scope, 
                                                            className: 'ngdialog-theme-default', 
                                                            controller:"PetsDialogController",backdrop: 
                                                            'static',keyboard: false,
                                                            closeByEscape: false,
                                                            closeByDocument: false })
        }


}])


.controller('PetsDialogController', ['$rootScope', '$stateParams','$timeout','$window','$scope', 'AuthFactory',
	'SpeciesFactory','RacesFactory','PetsFactory','ngDialog',
	function ($rootScope, $stateParams,$timeout, $window, $scope, AuthFactory, SpeciesFactory, RacesFactory, 
		PetsFactory, ngDialog) {

		 
		$scope.years = []
        for(var i=2019; i> 2000; i--){
        	$scope.years.push(i)
        }

        $rootScope.profileActive = 'pets'

		$scope.onSpecieSelected = function() {

					RacesFactory.query({ specieId: $scope.pet.specie._id})
			            .$promise.then(
			                function (response) {
			                	console.log(response)
			                	$scope.races = response
			                	filterRacesNameLanguage()
			                },
			                function (err) {
			                    console.log(err)
			                }
		        ) 
				}

    	if($rootScope.pet_id_for_dialog == 0){
    		$scope.pet = {
	        	name: '',
	            specie: 0,
	            birthday:0,
	            race: 0,
	            weight: 0,
	            country: 'AR',
	            user: AuthFactory.getIduser()
	        }
    	}else{
    		for(var i=0; i < $rootScope.pets.length; i++){
    			if($rootScope.pets[i]._id == $rootScope.pet_id_for_dialog){
    				$scope.pet = $rootScope.pets[i]
    				if($scope.pet.specie != null ){
    					$scope.pet.specie["name"] = AuthFactory.getLang() == 'es' ? 
    											$scope.pet.specie["name_es"] : $scope.pet.specie["name_en"] 
    					$scope.onSpecieSelected()	
    				}
    				if($scope.pet.race != null ){
						$scope.pet.race["name"] = AuthFactory.getLang() == 'es' ? 
    											$scope.pet.race["name_es"] : $scope.pet.race["name_en"] 
    				}
    				
    				
    			}
    		}

    		
    	}
        SpeciesFactory.query({ })
            .$promise.then(
                function (response) {
                	$scope.species = response
                	filterSpeciesNameLanguage()
                },
                function (err) {
                    console.log(err);
                //    $window.location.reload()
                }
        	)
        	
        $scope.error = {
        	name: false,
        	specie: false,
        	race: false,
        	birthday: false, 
        	weight: false
        }
        $scope.race = [];

		console.log($scope.pet)
    	
		
    	function filterSpeciesNameLanguage(){
    		for(var i=0; i< $scope.species.length; i++){
    			$scope.species[i]["name"] = AuthFactory.getLang() == 'es' ? 
    											$scope.species[i]["name_es"] : $scope.species[i]["name_en"] 
    		}
    	}
    	function filterRacesNameLanguage(){
    		for(var i=0; i< $scope.races.length; i++){
    			$scope.races[i]["name"] = AuthFactory.getLang() == 'es' ? 
    											$scope.races[i]["name_es"] : $scope.races[i]["name_en"] 
    		}
    	}

    	$scope.updatePet = function (){

    		if(filterPet()){
    			if(typeof $scope.pet._id == "undefined" ){
    				PetsFactory.save({petId: 0 }, $scope.pet)
			            .$promise.then(
			                function (response) {
			                	console.log(response)
			                	$rootScope.pets.push(response)
			                	ngDialog.close( $rootScope.petDialog )

			                },
			                function (err) {
			                    console.log(err)
			                }
		        		) 
		    		
    			}else{
    				PetsFactory.update({petId: $scope.pet._id }, $scope.pet)
			            .$promise.then(
			                function (response) {
			                	for(var i=0; i < $rootScope.pets.length; i++){
			                		if($rootScope.pets[i]._id == response._id){
			                			$rootScope.pets[i] = response
			                		}
			                	}
			                	ngDialog.close( $rootScope.petDialog )
			                },
			                function (err) {
			                    console.log(err)
			                }
		        		) 
	    		}
	    	}
    			
    	}
    	function filterPet(){
    		var ok = true
			console.log($scope.pet)
    		if(typeof $scope.pet.name == "undefined" ||$scope.pet.name == null || 
    			$scope.pet.name.length == 0 || $scope.pet.name == ' '){
    			ok = false
    			$scope.error.name = true
    		}else{
				$scope.error.name = false
    		}
    		if(typeof $scope.pet.specie == "undefined" || $scope.pet.specie == 0 || $scope.pet.specie == null){
    			ok = false
    			$scope.error.specie = true
    		}else{
				$scope.error.specie = false
    		}
    		if(typeof $scope.pet.race == "undefined" || $scope.pet.race == 0 || $scope.pet.race == null){
    			ok = false
    			$scope.error.race = true
    		}else{
				$scope.error.race = false
    		}
    		if(typeof $scope.pet.birthday == "undefined" || $scope.pet.birthday == 0){
    			ok = false
    			$scope.error.birthday = true
    		}else{
				$scope.error.birthday = false
    		}
    		if(typeof $scope.pet.weight == "undefined" || $scope.pet.weight == 0){
    			ok = false
    			$scope.error.weight = true
    		}else{
				$scope.error.weight = false
    		}
    		if(ok){
    			$scope.pet.specie = $scope.pet.specie._id
    			$scope.pet.race = $scope.pet.race._id
    		}
    		return ok
    	}
        
}])